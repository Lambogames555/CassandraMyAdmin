using System.Security.Cryptography;
using System.Text;

namespace CassandraMyAdmin.Other.Manager;

public class CaptchaManager
{
    private const int SaltLength = 10;
    private static readonly Dictionary<string, DateTime> CaptchaDictionary = new();
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromMinutes(1);

    private static bool CheckProofOfWork(string hash, string salt, string randomString)
    {
        var difficulty = Globals.Settings.captchaDifficulty;
        
        if (hash[..difficulty] != new string('0', difficulty)) return false;

        var testHash = CalculateHash(salt, randomString);
        return hash == testHash;
    }

    private static string CalculateHash(string seed, string randomString)
    {
        var input = seed + randomString;
        var inputBytes = Encoding.ASCII.GetBytes(input);
        var hashBytes = SHA256.HashData(inputBytes);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }

    private static string GenerateRandomString(int length)
    {
        const string allowedChars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
        var randomBytes = new byte[length];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        var result = new StringBuilder(length);
        foreach (var b in randomBytes) result.Append(allowedChars[b % allowedChars.Length]);
        return result.ToString();
    }

    // Start the cleaner timer
    private static readonly Timer cleanerTimer = new Timer(CleanUpExpiredCaptchas, null, CleanupInterval, CleanupInterval);

    private static void CleanUpExpiredCaptchas(object state)
    {
        var now = DateTime.Now;
        var expiredCaptchas = CaptchaDictionary.Where(kvp => kvp.Value <= now).Select(kvp => kvp.Key).ToList();
        foreach (var captcha in expiredCaptchas)
        {
            CaptchaDictionary.Remove(captcha);
        }
    }

    public static string GenerateCaptcha()
    {
        var salt = GenerateRandomString(SaltLength);

        CaptchaDictionary.Add(salt, DateTime.Now.AddMinutes(2));

        return salt;
    }

    public static string CheckCaptcha(string solution)
    {
        if (string.IsNullOrEmpty(solution) || solution == "notSolved")
            return "No Proof of Work solution provided.";

        var parts = solution.Split('|');
        if (parts.Length != 3)
            return "Invalid Proof of Work solution.";

        var hash = parts[0];
        var randomString = parts[1];
        var salt = parts[2];

        if (!CaptchaDictionary.ContainsKey(salt))
            return "Invalid Proof of Work salt.";

        CaptchaDictionary.Remove(salt);

        return !CheckProofOfWork(hash, salt, randomString) ? "Invalid Proof of Work solution." : string.Empty;
    }
}