using System.Text.Json;
using CassandraMyAdmin.Other.Objects;
using Microsoft.Extensions.Caching.Memory;

namespace CassandraMyAdmin.Other.Helpers;

public class GitHubApiHelper
{
    private const string ContributorsApiUrl = "https://api.github.com/repos/{0}/{1}/contributors?per_page=100";
    private const string ReleasesApiUrl = "https://api.github.com/repos/{0}/{1}/releases/latest";
    
    private readonly string _owner;
    private readonly string _repo;
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _memoryCache;

    public GitHubApiHelper(string owner, string repo, IMemoryCache memoryCache)
    {
        _owner = owner;
        _repo = repo;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "CassandraMyAdmin");
        _memoryCache = memoryCache;
    }

    public async Task<IEnumerable<Contributor>> GetContributorsAsync()
    {
        var cacheKey = $"github-{_owner}-{_repo}-contributors";

        if (_memoryCache.TryGetValue(cacheKey, out IEnumerable<Contributor> cachedContributors))
        {
            return cachedContributors!;
        }

        var response = await _httpClient.GetAsync(string.Format(ContributorsApiUrl, _owner, _repo));
        response.EnsureSuccessStatusCode();
        var responseBody = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var contributors = JsonSerializer.Deserialize<List<Contributor>>(responseBody, options);

        var cacheOptions = new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) };
        _memoryCache.Set(cacheKey, contributors, cacheOptions);

        return contributors!;
    }

    
    public async Task<Release> GetLatestReleaseAsync()
    {
        var cacheKey = $"github-{_owner}-{_repo}-latest-release";

        if (_memoryCache.TryGetValue(cacheKey, out Release cachedRelease))
        {
            return cachedRelease;
        }

        var response = await _httpClient.GetAsync(string.Format(ReleasesApiUrl, _owner, _repo));
        response.EnsureSuccessStatusCode();
        var responseBody = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var release = JsonSerializer.Deserialize<Release>(responseBody, options);

        var cacheOptions = new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) };
        _memoryCache.Set(cacheKey, release, cacheOptions);

        return release;
    }
}
