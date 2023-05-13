using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Cassandra;
using CassandraMyAdmin.Other.Enums;
using CassandraMyAdmin.Other.Manager;
using CassandraMyAdmin.Other.Objects;
using ISession = Cassandra.ISession;

namespace CassandraMyAdmin.Other;

public abstract partial class Helper
{
    internal static SessionStatus ValidateAndRetrieveCassandraManagerFromViewMode(object viewModel,
        out CassandraManager cassandraManager)
    {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(viewModel, null, null);
        var isValid = Validator.TryValidateObject(viewModel, validationContext, validationResults, true);

        if (!isValid)
        {
            cassandraManager = null!;
            return SessionStatus.BadRequest;
        }

        var sessionIdProperty = viewModel.GetType().GetProperty("sessionId");
        if (sessionIdProperty != null && sessionIdProperty.GetValue(viewModel) is string sessionId &&
            !string.IsNullOrEmpty(sessionId))
        {
            if (!Globals.Sessions.ContainsKey(sessionId))
            {
                cassandraManager = null!;
                return SessionStatus.Unauthorized;
            }

            cassandraManager = Globals.Sessions[sessionId].Item1;

            return SessionStatus.Ok;
        }

        // error, viewmodel has no sessionId
        cassandraManager = null!;
        return SessionStatus.InternalServerError;
    }

    public static bool IsUserSuperUser(CassandraManager cassandraManager, string username)
    {
        // Retrieve a new session object using the CassandraManager
        var session = cassandraManager.GetSession();

        // Prepare a CQL statement to query the 'system_auth.roles' table for the 'is_superuser' column
        var preparedStatement = session.Prepare("SELECT is_superuser FROM system_auth.roles WHERE role = ?");

        // Bind the 'username' variable to the prepared statement to create a 'BoundStatement'
        var boundStatement = preparedStatement.Bind(username);

        // execute the CQL query to get the user roles
        var rows = session.Execute(boundStatement);

        // retrieve the first row (if any) and get the boolean value from the "is_superuser" column
        var isSuperuser = rows.FirstOrDefault()?.GetValue<bool>("is_superuser") ?? false;

        return isSuperuser;
    }

    public static Dictionary<string, List<string>> GetUserPermissions(string username, ISession session)
    {
        // Prepare the CQL statement
        var cql = "SELECT * FROM system_auth.role_permissions WHERE role = ?";

        // Create the statement and bind the role parameter
        var statement = session.Prepare(cql);
        var boundStatement = statement.Bind(username);

        // Execute the statement and retrieve the result
        var result = session.Execute(boundStatement);

        var permissionsDictionary = new Dictionary<string, List<string>>();
                
          
        // Process the result
        foreach (var row in result)
        {
            // Access the resource and permissions columns
            var resource = row.GetValue<string>("resource");
            var permissions = row.GetValue<List<string>>("permissions");

            //ignore "functions"
            if (resource.StartsWith("functions"))
                continue;
                    
            // Process the resource and permissions
            permissionsDictionary.Add(resource, permissions);
        }

        return permissionsDictionary;
    }

    public static string CreatePermissionResourceString(Permissions permissions)
    {
        // Store the initial resourceName value in permissionsString variable.
        var permissionResourceString = permissions.resourceName.ToLower().Replace("all keyspaces", "data").Replace("keyspace", "data").Replace("table", "data");

        // Check if resourceNameValue is not null, empty, or contains only whitespace.
        if (!string.IsNullOrWhiteSpace(permissions.resourceNameValue)) {
            // Append "/" followed by resourceNameValue with dots replaced by forward slashes.
            permissionResourceString += "/" + permissions.resourceNameValue;
        }

        // Return the final permissionsString value.
        return permissionResourceString;
    }

    public static bool HasUserPermissionResource(string permissionResourceString, Dictionary<string, List<string>> permissionsDictionary, out List<string> permissionsResourceData)
    {
        var tempPermissionResourceString = permissionResourceString.Replace(".", "/");
        
        foreach (var permissionsKeyPair in permissionsDictionary)
        {
            if (permissionsKeyPair.Key == tempPermissionResourceString)
            {
                permissionsResourceData = permissionsKeyPair.Value;
                return true;
            }
        }

        permissionsResourceData = null;
        return false;
    }

    public static bool ContainsPermissionsResourceKey(string permissionKey, List<Permissions> permissionsList)
    {
        foreach (var permission in permissionsList)
        {
            var permissionsResourceName = CreatePermissionResourceString(permission).Replace(".", "/").Replace("all ", "");
            
            // Check if the resourceNameValue of the current permission matches the permissionKey
            if (permissionsResourceName == permissionKey)
                return true;
        }

        // If no matching permission was found, return false
        return false;

    }

    public static string GeneratePermissionsCqlStatement(string privilege, string username, string resourceName, string resourceNameValue, bool grant)
    {
        // Validate all input
        if (ValidateCqlInput().IsMatch(privilege) ||
            ValidateCqlInput().IsMatch(username) ||
            ValidateCqlInput().IsMatch(resourceName) ||
            ValidateCqlInput().IsMatch(resourceNameValue))
        {
            return string.Empty;
        }

        // Determine the grant/revoke keyword and the to/from keyword based on the 'grant' parameter
        var grantRevoke = grant ? "GRANT" : "REVOKE";
        var toFrom = grant ? "TO" : "FROM";

        if (resourceName == "data")
        {
            // If the resource name is 'data', grant/revoke privilege on all keyspaces
            return $"{grantRevoke} {privilege} ON ALL KEYSPACES {toFrom} {username};";
        }

        // Check if the resource name is a data resource
        var slashIndex = resourceNameValue.IndexOf('/');
        var secondSlashIndex = resourceNameValue.IndexOf('/', slashIndex + 1);
        var isDataResource = resourceName.StartsWith("data/") && !resourceName.Contains(".") &&
                              !(slashIndex != -1 && secondSlashIndex == -1) && !resourceNameValue.Contains(".");
        if (isDataResource)
        {
            // If the resource name is a data resource, prepend 'KEYSPACE' to the resourceNameValue
            resourceNameValue = "KEYSPACE " + resourceNameValue;
        }

        // Replace slashes with dots in the resourceNameValue
        resourceNameValue = resourceNameValue.Replace("/", ".");

        // Determine the appropriate resource clause based on the resourceName
        var resourceClause = resourceName.Contains("role") ?
            (resourceNameValue == "roles" || string.IsNullOrWhiteSpace(resourceNameValue) ? "ALL ROLES " : "ROLE " + resourceNameValue.Replace("roles.", ""))
            : resourceName.Contains("all") ? resourceName : resourceNameValue;

        // Construct and return the CQL statement
        return $"{grantRevoke} {privilege} ON {resourceClause} {toFrom} {username};";
    }

    public static List<string> GetAllTables(Cluster cluster)
    {
        var tablesList = new List<string>();
        
        var keySpaces = cluster.Metadata.GetKeyspaces();

        foreach (var keySpace in keySpaces)
        {
            if (Globals.Settings.hideSystemKeySpaces && keySpace.StartsWith("system"))
                continue;

            var tables = cluster.Metadata.GetTables(keySpace);
            foreach (var table in tables)
            {
                tablesList.Add($"{keySpace}.{table}");
            }
        }

        return tablesList;
    }

    public static IEnumerable<string> GetAllRoles(ISession session)
    {
        var query = "SELECT * FROM system_auth.roles";
        var rows = session.Execute(query);

        foreach (var row in rows)
        {
            yield return row.GetValue<string>("role");
        }
    }
    
    public static string GetIpAddress(HttpContext httpContext)
    {
        if (!string.IsNullOrEmpty(httpContext.Request.Headers["CF-CONNECTING-IP"]))
            return httpContext.Request.Headers["CF-CONNECTING-IP"]!;

        var ipAddress = httpContext.GetServerVariable("HTTP_X_FORWARDED_FOR");

        if (!string.IsNullOrEmpty(ipAddress))
        {
            var addresses = ipAddress.Split(',');
            if (addresses.Length != 0)
                return addresses[0];
        }

        return httpContext.Connection.RemoteIpAddress?.ToString()!;
    }

    //TODO this should block cql attacks? idk... i should look into it
    [GeneratedRegex("[;&'\"]")]
    private static partial Regex ValidateCqlInput();
}