using CassandraMyAdmin.Other.Enums;
using CassandraMyAdmin.Other.Objects;

namespace CassandraMyAdmin.Other.Manager;

public class Fail2BanManager
{
    private const double PointsForBan = 4;
    private static readonly TimeSpan cleanupInterval = TimeSpan.FromMinutes(5);
    
    private static Dictionary<string, DateTime> _bannedIps = new();
    
    private static List<WatchedIpAddress> _watchedIpAddressesList = new();

    internal static bool IsIpBanned(string ip)
    {
        return _bannedIps.ContainsKey(ip);
    }
    
    internal static void AddViolation(string ip, Fail2BanReason reason)
    {
        // Get the object representing the watched IP address
        var watchedIpObject = GetWatchedIpObject(ip);

        // If the watched IP address is not found, create a new object and add it to the list
        if (watchedIpObject == null)
        {
            watchedIpObject = new WatchedIpAddress();
            watchedIpObject.ipAddress = ip;
            _watchedIpAddressesList.Add(watchedIpObject);
        }

        // Increment the points of the watched IP address based on the reason for the violation
        switch (reason)
        {
            case Fail2BanReason.CaptchaFail:
                watchedIpObject.points += 2;
                break;
            case Fail2BanReason.BadLogin:
                watchedIpObject.points++;
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(reason), reason, null);
        }
    
        // Update the timestamp of the last violation to the current time
        watchedIpObject.lastViolation = DateTime.Now;

        // If the watched IP address has accumulated enough points for a ban
        if (watchedIpObject.points >= PointsForBan)
        {
            // Remove the watched IP address from the list
            _watchedIpAddressesList.Remove(watchedIpObject);

            // Add the IP address to the banned IPs dictionary with an expiration time of 2 hours from now
            _bannedIps.Add(watchedIpObject.ipAddress, DateTime.Now.AddHours(2));
        }
    }


    private static WatchedIpAddress? GetWatchedIpObject(string ip)
    {
        foreach (var watchedIpAddress in _watchedIpAddressesList)
        {
            if (watchedIpAddress.ipAddress == ip)
                return watchedIpAddress;
        }

        return null;
    }
    
    // Start the cleaner timer
    private static readonly Timer cleanerTimer = new Timer(CleanUp, null, cleanupInterval, cleanupInterval);

    private static void CleanUp(object state)
    {
        // Get the current timestamp
        var now = DateTime.Now;
    
        // Find all watched IP addresses with violations that have expired
        var expiredViolations = _watchedIpAddressesList.Where(wip => wip.lastViolation <= now).ToList();

        // Iterate through each expired violation
        foreach (var expiredViolation in expiredViolations)
        {
            // Decrement the points of the expired violation
            expiredViolation.points--;
        
            // If the points reach or go below zero, remove the violation from the list
            if (expiredViolation.points <= 0)
                _watchedIpAddressesList.Remove(expiredViolation);
        }
    
        // Find all banned IP addresses that have expired
        var expiredBans = _bannedIps.Where(bip => bip.Value <= now).Select(bip => bip.Key).ToList();

        // Iterate through each expired ban
        foreach (var expiredBan in expiredBans)
        {
            // Remove the expired ban from the list
            _bannedIps.Remove(expiredBan);
        }
    }


    public static bool IsIpSuspicious(HttpContext httpContext)
    {
        // Get the IP address of the current request
        var ip = Helper.GetIpAddress(httpContext);

        // Check if the IP address is in the banned list
        if (IsIpBanned(ip))
            return true;

        // Get the object representing the watched IP address
        var watchedIpAddress = GetWatchedIpObject(ip);

        // If the watched IP address is not found, it is not suspicious
        if (watchedIpAddress == null)
            return false;

        // Check if the watched IP address has accumulated enough points for a ban
        return watchedIpAddress.points >= PointsForBan * 0.5;
    }
}