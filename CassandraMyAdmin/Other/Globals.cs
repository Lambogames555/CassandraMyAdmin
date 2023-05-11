using CassandraMyAdmin.Other.Helpers;
using CassandraMyAdmin.Other.Manager;
using Microsoft.Extensions.Caching.Memory;

namespace CassandraMyAdmin.Other;

public class Globals
{
    internal const string Version = "0.2.0";

    internal static readonly GitHubApiHelper GitHubApiHelper = new("Lambogames555", "CassandraMyAdmin", new MemoryCache(new MemoryCacheOptions()));
    
    //TODO auto logout of sessions / delete sessions on logout
    internal static Dictionary<string, CassandraManager> Sessions = new();

    internal static Settings.Settings Settings = null!;
}