using System.Collections;
using System.Text.RegularExpressions;
using Cassandra;
using CassandraMyAdmin.Models.ViewModels;
using CassandraMyAdmin.Other;
using CassandraMyAdmin.Other.Enums;
using CassandraMyAdmin.Other.Manager;
using CassandraMyAdmin.Other.Objects;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CassandraMyAdmin.Controllers;

[ApiController]
[Route("[controller]")]
public partial class CassandraController : ControllerBase
{
    //TODO make all things async?
    //TODO fail2ban with settings

    [HttpPost]
    [Route("[action]")]
    public IActionResult ConnectToCassandra([FromBody] ConnectToCassandraViewModel viewModel)
    {
        // Check if the view model data is valid
        if (!ModelState.IsValid)
            return BadRequest();

        var username = viewModel.username;
        var password = viewModel.password;
        
        // Create a new CassandraManager object using the provided username and password
        var cassandraManager = new CassandraManager(username, password);

        // Retrieve a new session object using the CassandraManager
        var session = cassandraManager.GetSession();

        
        // Is session is "null" then an error as occured
        if (session == null)
        {
            // Return a error status code if an error occured
            return StatusCode(cassandraManager.GetErrorCode());
        }

        // Try to execute a simple query using the authenticated session object
        try
        {
            session.Execute("SELECT * FROM system.local LIMIT 1");
        }
        catch (AuthenticationException)
        {
            // Return a 401 Unauthorized status code if the authentication failed
            return StatusCode(401);
        }
        catch (Exception ex)
        {
            // Handle other types of exceptions and return a 500 Internal Server Error status code
            //Console.WriteLine("Error: " + ex.Message);

            //return StatusCode(500);

            // Return a 401 Unauthorized status code
            return StatusCode(401);
        }

        // Check if user is a superuser if the setting "only superusers can login" is active
        if (Globals.Settings.onlySuperUserLogin && !Helper.IsUserSuperUser(cassandraManager, username))
        {
            // Return a 403 Forbidden status code if the user is not a superuser
            return StatusCode(403);
        }

        // Generate a unique session ID
        var sessionId = Guid.NewGuid() + "-" + Guid.NewGuid() + "-" + Guid.NewGuid();

        // Add the new session to a global dictionary for future reference
        Globals.Sessions.Add(sessionId, cassandraManager);

        // Return the generated session ID as a successful response
        return Ok(sessionId);
    }

    [HttpPost]
    [Route("[action]")]
    public IActionResult GetCassandraUsers([FromBody] SessionIdViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get a Cassandra session using the manager
        var session = cassandraManager.GetSession();

        // Execute a query to retrieve all users from the 'system_auth.users' table
        var rows = session.Execute("select * from system_auth.roles;");

        // Iterate through each row returned by the query and add the user to a list of Cassandra users
        var cassandraUsersList = rows.Select(row => new CassandraUser
            { Username = row.GetValue<string>("role"), IsSuperuser = row.GetValue<bool>("is_superuser") }).ToList();

        // Return the list of Cassandra users as a HTTP OK response
        return Ok(cassandraUsersList);
    }


    [HttpPost]
    [Route("[action]")]
    public IActionResult GetCassandraKeySpaces([FromBody] SessionIdViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get a Cassandra session using the manager
        var session = cassandraManager.GetSession();

        // Execute a query to retrieve all key spaces from the 'system_schema.keyspaces' table
        var rows = session.Execute("SELECT * FROM system_schema.keyspaces;");

        // Iterate through each row returned by the query and add the user to a list of Cassandra keyspaces
        var keyspaces = rows.Select(row => row.GetValue<string>("keyspace_name")).ToList();

        // If the 'hideSystemKeySpaces' setting is enabled, remove all keyspaces that start with "system"
        if (Globals.Settings.hideSystemKeySpaces)
            keyspaces = keyspaces.Where(keyspace => !keyspace.StartsWith("system")).ToList();

        // Define a new dictionary to store the count of tables in each keyspace
        var keySpacesDictionary = new Dictionary<string, long>();
        
        
        // If the 'countKeyspaceTables' setting is enabled, count the number of tables in each keyspace
        if (Globals.Settings.countKeyspaceTables)
        {
            // Prepare the CQL query to get the count of tables in a given keyspace
            var preparedQuery = session.Prepare("SELECT COUNT(*) FROM system_schema.tables WHERE keyspace_name = ?");

            // Loop through each keyspace in the keyspaces collection
            foreach (var keyspace in keyspaces)
            {
                // Bind the keyspace parameter to the prepared statement
                var boundQuery = preparedQuery.Bind(keyspace);

                // Execute the prepared statement and get the first row of the result set
                var row = session.Execute(boundQuery).FirstOrDefault();

                // Get the count of tables from the query result using the "count" column name
                var count = row.GetValue<long>("count");

                // Add an entry to the dictionary with the keyspace name as the key and the table count as the value
                keySpacesDictionary.Add(keyspace, count);
            }    
        }
        else
        {
            // Loop through each keyspace in the keyspaces collection
            foreach (var keyspace in keyspaces)
            {
                // Add an entry to the dictionary with the keyspace name as the key and the "-1" as the value
                keySpacesDictionary.Add(keyspace, -1);   
            }
        }
        

        // Return an HTTP 200 (OK) response with the keyspaces dictionary as the response body
        return Ok(keySpacesDictionary);
    }

    [HttpPost]
    [Route("[action]")]
    public IActionResult GetCassandraKeySpaceTables([FromBody] GetTablesViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get a Cassandra session using the manager
        var session = cassandraManager.GetSession();

        // Define the prepared statement
        var preparedStatement = session.Prepare("SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?;");

        // Get keyspace name from viewmodel
        var keyspaceName = viewModel.keySpaceName;

        // Bind the keyspace name to the prepared statement
        var boundStatement = preparedStatement.Bind(keyspaceName);

        // Execute the prepared statement and fetch the results
        var rows = session.Execute(boundStatement);

        // Iterate through the rows and print the table names
        var tableNamesList = rows.Select(row => row.GetValue<string>("table_name")).ToList();


        // TODO store these values temporarily and create better system for it (row count)

        // Define a new dictionary to store the count of rows in each table
        var tableDictionary = new Dictionary<string, long>();

        // If the 'countTableRows' setting is enabled, count the number of rows in each table
        if (Globals.Settings.countTableRows)
        {

            // Loop through each table name in the list of table names
            foreach (var tableName in tableNamesList)
                try
                {
                    // CQL query to select all rows from the specified table in the specified keyspace
                    var query = $"SELECT * FROM {keyspaceName}.{tableName}";

                    // execute the query
                    var result = session.Execute(query);

                    // Get the count of rows from the query result
                    var count = result.Count();

                    // Add an entry to the dictionary with the table name as the key and the row count as the value
                    tableDictionary.Add(tableName, count);
                }
                catch (Exception e)
                {
                    // Add an entry to the dictionary with the table name as the key and the "-1" as the value
                    tableDictionary.Add(tableName, -1);
                }
        }
        else
        {
            // Loop through each table name in the list of table names
            foreach (var tableName in tableNamesList)
            {
                // Add an entry to the dictionary with the table name as the key and the "-1" as the value
                tableDictionary.Add(tableName, -1);
            }
        }

        // Return an HTTP 200 (OK) response with the table dictionary as the response body
        return Ok(tableDictionary);
    }

    [HttpPost]
    [Route("[action]")]
    public IActionResult GetCassandraHosts([FromBody] SessionIdViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get the cluster from the cassandraManager
        var cluster = cassandraManager.GetCluster();

        // Get the metadata for the cluster
        var metadata = cluster.Metadata;

        // Get the list of connected hosts
        var connectedHosts = metadata.AllHosts().ToList();

        // Create a dictionary of connected hosts, with Datacenter as the key
        var hostsDict = connectedHosts.GroupBy(host => host.Datacenter)
            .ToDictionary(group => group.Key,
                group => group.Select(host => new CassandraHost
                {
                    HostId = host.HostId.ToString(),
                    IpAddress = host.Address.ToString(),
                    Rack = host.Rack,
                    Version = host.CassandraVersion.ToString(),
                    IsUp = host.IsUp
                }).ToList());

        // Return the dictionary of connected hosts as a HTTP OK response
        return Ok(hostsDict);
    }


    [HttpPost]
    [Route("[action]")]
    public IActionResult GetCassandraStatistics([FromBody] SessionIdViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get the session from the cassandraManager
        //var session = cassandraManager.GetSession();
        /*
  // Get metrics object
        IDriverMetrics metrics = session.GetMetrics();
  
  // Get session metrics and / or node metrics
        IReadOnlyDictionary<Host, IMetricsRegistry<NodeMetric>> allNodeMetrics = metrics.NodeMetrics;
        IMetricsRegistry<SessionMetric> sessionMetrics = metrics.SessionMetrics;
  
  // Get specific host's node metrics
        Host host = session.Cluster.AllHosts().First();
        allNodeMetrics.TryGetValue(host, out IMetricsRegistry<NodeMetric> nodeMetrics);
  
  // Get a specific metric of a specific host
        IDriverCounter counter = metrics.GetNodeMetric<IDriverCounter>(host, NodeMetric.Counters.);
  */

        var response = new Hashtable();

        response.Add("username", cassandraManager.GetUsername());

        var cluster = cassandraManager.GetCluster();

        var clusterName = cluster.Metadata.ClusterName;

        response.Add("clusterName", clusterName ?? "N/A");

        return Ok(response);
    }

    [HttpPost]
    [Route("[action]")]
    public IActionResult SetUser([FromBody] SetUserViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get the Session from the Cassandra manager
        var session = cassandraManager.GetSession();

        switch (viewModel.action)
        {
            case UserChangeAction.Rename:
            {
                //TODO dont work -> we need a new password to create the new user, i need to implement this.

                // Get variables from the viewmodel
                var oldUsername = viewModel.username;
                var newUsername = viewModel.options["newUsername"];

                // Validate the input values
                if (ValidateCqlInput().IsMatch(oldUsername) || ValidateCqlInput().IsMatch(newUsername))
                    return BadRequest();

                // Get the salted hash of the password for the old user
                var getSaltedHashCql = $"SELECT salted_hash FROM system_auth.roles WHERE role = '{oldUsername}'";
                var saltedHashResult = session.Execute(getSaltedHashCql).FirstOrDefault();
                var saltedHash = saltedHashResult?["salted_hash"].ToString();

                // Create the new user with the desired username and password
                var createUserCql = $"CREATE USER '{newUsername}' WITH PASSWORD 'cassandraMyAdmin";
                session.Execute(createUserCql);

                // Update the salted_hash for the user
                var setSaltedHashCql =
                    $"UPDATE system_auth.roles SET salted_hash = '{saltedHash}' WHERE role = '{newUsername}'";
                session.Execute(setSaltedHashCql);

                // Get the permissions and roles for the old user
                var getPermissionsCql = $"SELECT * FROM system_auth.role_permissions WHERE role = '{oldUsername}'";
                var permissions = session.Execute(getPermissionsCql);

                var getRolesCql = $"SELECT * FROM system_auth.role_members WHERE role = '{oldUsername}'";
                var roles = session.Execute(getRolesCql);

                // Grant the same permissions and roles to the new user
                foreach (var permission in permissions)
                {
                    var grantPermissionCql =
                        $"GRANT {permission["permission"]} ON {permission["resource"]} TO {newUsername}";
                    session.Execute(grantPermissionCql);
                }

                foreach (var role in roles)
                {
                    var grantRoleCql = $"GRANT {role["role"]} TO {newUsername}";
                    session.Execute(grantRoleCql);
                }


                //ignore all AllowAllAuthorizer errors
                try
                {
                    // Revoke the permissions and roles from the old user
                    var revokePermissionsCql = $"REVOKE ALL PERMISSIONS ON ALL KEYSPACES FROM {oldUsername}";
                    session.Execute(revokePermissionsCql);

                    var revokeRolesCql = $"REVOKE ALL ON ALL ROLES FROM {oldUsername}";
                    session.Execute(revokeRolesCql);
                }
                catch (Exception)
                {
                    // ignored
                }

                // Drop the old user
                var dropUserCql = $"DROP USER {oldUsername}";
                session.Execute(dropUserCql);

                break;
            }
            case UserChangeAction.Promote:
            {
                // Get variables from the viewmodel
                var username = viewModel.username;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(username)) return BadRequest();

                var giveUserSuperUserCql = $"ALTER USER '{username}' SUPERUSER;";

                // Execute statement
                session.Execute(giveUserSuperUserCql);

                break;
            }
            case UserChangeAction.Demote:
            {
                // Get variables from the viewmodel
                var username = viewModel.username;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(username)) return BadRequest();

                var removeFromUserSuperUserCql = $"ALTER USER '{username}' NOSUPERUSER;";

                // Execute statement
                session.Execute(removeFromUserSuperUserCql);

                break;
            }
            case UserChangeAction.Delete:
            {
                // Get variables from the viewmodel
                var username = viewModel.username;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(username)) return BadRequest();

                var deleteUserCql = $"DROP USER '{username}';";

                // execute statement
                session.Execute(deleteUserCql);

                break;
            }
            case UserChangeAction.Create:
            {
                // Get variables from the viewmodel
                var username = viewModel.username;
                var password = viewModel.options["password"];
                var asSuperUser = bool.Parse(viewModel.options["asSuperUser"]);

                // Validate the input values
                if (ValidateCqlInput().IsMatch(username) || ValidateCqlInput().IsMatch(password)) return BadRequest();


                string cqlQuery;

                // ReSharper disable once ConvertIfStatementToConditionalTernaryExpression
                if (asSuperUser)
                    cqlQuery = $"CREATE USER '{username}' WITH PASSWORD '{password}' SUPERUSER;";
                else
                    cqlQuery = $"CREATE USER '{username}' WITH PASSWORD '{password}'";


                // Execute statement
                session.Execute(cqlQuery);

                break;
            }
            default:
                return BadRequest();
        }

        return Ok();
    }


    [HttpPost]
    [Route("[action]")]
    public IActionResult SetKeySpace([FromBody] SetKeySpaceViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get the Session from the Cassandra manager
        var session = cassandraManager.GetSession();

        switch (viewModel.action)
        {
            case KeySpaceChangeAction.Create:
            {
                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;
                var replicationFactor = viewModel.options["replicationFactor"];


                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName) || ValidateCqlInput().IsMatch(replicationFactor))
                    return BadRequest();

                // Define the replication strategy for your keyspace
                var replication = "{'class': 'SimpleStrategy', 'replication_factor': " + replicationFactor + "}";

                // Execute statement
                session.Execute($"CREATE KEYSPACE {keySpaceName} WITH replication = {replication};");

                break;
            }
            case KeySpaceChangeAction.Rename:
                //TODO implement
                break;
            case KeySpaceChangeAction.Delete:
            {
                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName)) return BadRequest();

                // Execute statement
                session.Execute($"DROP KEYSPACE {keySpaceName};");

                break;
            }
            default:
                throw new ArgumentOutOfRangeException();
        }

        return Ok();
    }


    [HttpPost]
    [Route("[action]")]
    public IActionResult SetTable([FromBody] SetTableViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        // Get the Session from the Cassandra manager
        var session = cassandraManager.GetSession();


        switch (viewModel.action)
        {
            case TableChangeAction.Create:
            {
                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;
                var tableName = viewModel.tableName;
                var column = viewModel.options["column"];
                var primaryKeys = viewModel.options["primaryKeys"];

                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName) || ValidateCqlInput().IsMatch(tableName) ||
                    ValidateCqlInput().IsMatch(column) || ValidateCqlInput().IsMatch(primaryKeys)) return BadRequest();

                // Execute statement
                session.Execute($"CREATE TABLE {keySpaceName}.{tableName} ({column}, PRIMARY KEY ({primaryKeys}));");

                break;
            }
            case TableChangeAction.Clear:
            {
                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;
                var tableName = viewModel.tableName;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName) || ValidateCqlInput().IsMatch(tableName))
                    return BadRequest();

                // Execute statement
                session.Execute($"TRUNCATE TABLE {keySpaceName}.{tableName};");

                break;
            }
            case TableChangeAction.Delete:
            {
                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;
                var tableName = viewModel.tableName;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName) || ValidateCqlInput().IsMatch(tableName))
                    return BadRequest();

                // Execute statement
                session.Execute($"DROP TABLE {keySpaceName}.{tableName};");

                break;
            }
            case TableChangeAction.Rename:
                //TODO implement
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }

        return Ok();
    }


    [HttpPost]
    [Route("[action]")]
    public IActionResult GetTableData([FromBody] GetTableDataViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out var cassandraManager))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        var response = new List<string>();

        switch (viewModel.action)
        {
            case GetTableDataAction.ColumNames:
            {
                // Get the cluster from the Cassandra manager
                var cluster = cassandraManager.GetCluster();

                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;
                var tableName = viewModel.tableName;

                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName) || ValidateCqlInput().IsMatch(tableName))
                    return BadRequest();

                // Retrieve the metadata for the table
                var metadata = cluster.Metadata;
                var table = metadata.GetTable(keySpaceName, tableName);

                // Retrieve the column names for the table
                var columnNames = table.TableColumns.Select(column => column.Name).ToList();
                columnNames.Reverse();

                response = columnNames; //columnNames.Select(s => (dynamic)s).ToList();

                return Ok(response);
            }
            case GetTableDataAction.Rows:
            {
                // Get the session from the Cassandra manager
                var session = cassandraManager.GetSession();

                // Get the cluster from the Cassandra manager
                var cluster = cassandraManager.GetCluster();


                // Get variables from the viewmodel
                var keySpaceName = viewModel.keySpaceName;
                var tableName = viewModel.tableName;

                var page = int.Parse(viewModel.options["page"]);

                // Validate the input values
                if (ValidateCqlInput().IsMatch(keySpaceName) || ValidateCqlInput().IsMatch(tableName))
                    return BadRequest();


                // Set up the CQL query
                var cqlQuery = $"SELECT * FROM {keySpaceName}.{tableName};";

                // Retrieve the metadata for the table
                var metadata = cluster.Metadata;
                var table = metadata.GetTable(keySpaceName, tableName);

                // Retrieve the column names for the table
                var columnNames = table.TableColumns.Select(column => column.Name).ToList();
                columnNames.Reverse();

                // TODO dynamic page size
                const int pageSize = 7;

                // Execute the bound statement on the session to retrieve a result set
                var resultSet = session.Execute(cqlQuery).Skip((page - 1) * pageSize).Take(pageSize);

                // Iterate over each row in the result set
                foreach (var row in resultSet)
                {
                    // Create a new list to hold the values of the row
                    var rowElements = new List<object>();

                    // Iterate over each column name in the list of column names
                    foreach (var columnName in columnNames)
                        // Retrieve the value of the current column for the current row and add it to the list of row elements
                        rowElements.Add(row.GetValue<object>(columnName));

                    // Serialize the list of row elements as a JSON string and add it to the response list
                    response.Add(JsonConvert.SerializeObject(rowElements));
                }

                break;
            }
            default:
                throw new ArgumentOutOfRangeException();
        }

        return Ok(response);
    }

    //TODO move to an other controller?
    [HttpPost]
    [Route("[action]")]
    public async Task<IActionResult> GetAboutData([FromBody] SessionIdViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out _))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }
        
        var response = new Dictionary<string, string>
        {
            { "version", Globals.Version },
            { "contributors", JsonConvert.SerializeObject(await Globals.GitHubApiHelper.GetContributorsAsync()) }
        };

        //response.Add("latestRelease", JsonConvert.SerializeObject(await Globals.GitHubApiHelper.GetLatestReleaseAsync()));

        return Ok(response);
    }

    [HttpPost]
    [Route("[action]")]
    public async Task<IActionResult> GetUpdateInfo([FromBody] SessionIdViewModel viewModel)
    {
        // Validate viewmodel, check if sessionId exist and get the cassandra manager
        switch (Helper.ValidateAndRetrieveCassandraManagerFromViewMode(viewModel, out _))
        {
            case SessionStatus.Ok:
                break;
            case SessionStatus.BadRequest:
                return BadRequest();
            case SessionStatus.Unauthorized:
                return Unauthorized();
            case SessionStatus.InternalServerError:
                return StatusCode(500);
            default:
                throw new ArgumentOutOfRangeException();
        }

        var response = JsonConvert.SerializeObject(await Globals.GitHubApiHelper.GetLatestReleaseAsync());
        
        return Ok(response);
    }
    
    //TODO this should block cql attacks? idk... i should look into it
    [GeneratedRegex("[;&'\"]")]
    private static partial Regex ValidateCqlInput();
}