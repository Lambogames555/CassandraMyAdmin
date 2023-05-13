namespace CassandraMyAdmin.Other.Manager;

public class SessionsManager
{
    private static readonly TimeSpan cleanupInterval = TimeSpan.FromMinutes(5);

    // Start the cleaner timer
    private static readonly Timer cleanerTimer = new Timer(CleanUp, null, cleanupInterval, cleanupInterval);

    private static void CleanUp(object state)
    {
        // Get the current timestamp
        var now = DateTime.Now;
    
        var expiredSessions = Globals.Sessions.Where(session => session.Value.Item2 <= now).Select(session => session.Key).ToList();

        foreach (var expiredSession in expiredSessions)
        {
            Globals.Sessions.Remove(expiredSession);
        }
    }
}