using CassandraMyAdmin.Other.Helpers;
using CassandraMyAdmin.Other.Manager;
using Microsoft.Extensions.Caching.Memory;

namespace CassandraMyAdmin.Other;

public class Globals
{
    internal const string Version = "0.4.0";

    internal static readonly GitHubApiHelper GitHubApiHelper = new("Lambogames555", "CassandraMyAdmin", new MemoryCache(new MemoryCacheOptions()));
    
    internal static Dictionary<string, (CassandraManager, DateTime)> Sessions = new();

    internal static Settings.Settings Settings = null!;
}