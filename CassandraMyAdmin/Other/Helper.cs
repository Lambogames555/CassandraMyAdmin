using System.ComponentModel.DataAnnotations;
using CassandraMyAdmin.Other.Enums;
using CassandraMyAdmin.Other.Manager;

namespace CassandraMyAdmin.Other;

public abstract class Helper
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

            cassandraManager = Globals.Sessions[sessionId];

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
}