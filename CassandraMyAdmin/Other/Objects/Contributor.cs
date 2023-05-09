using System.Text.Json.Serialization;

namespace CassandraMyAdmin.Other.Objects;

public class Contributor
{
    public string Login { get; set; }
    
    [JsonPropertyName("html_url")]
    public string HtmlUrl { get; set; }
    
    [JsonPropertyName("avatar_url")]
    public string AvatarUrl { get; set; }
}