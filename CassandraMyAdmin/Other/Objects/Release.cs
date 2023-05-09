using System.Text.Json.Serialization;
using Newtonsoft.Json.Serialization;

namespace CassandraMyAdmin.Other.Objects;

public class Release
{
    
    [JsonPropertyName("html_url")]
    public string HtmlUrl { get; set; }
    
    [JsonPropertyName("tag_name")]
    public string TagName { get; set; }
    
    public string Name { get; set; }

    public string CurrentVersion { get; } = Globals.Version;
    //public bool Prerelease { get; set; }

    //[JsonPropertyName("published_at")]
    //public string PublishedAt { get; set; }

    //public string Body { get; set; }
}