using Newtonsoft.Json;

namespace CassandraMyAdmin.Other.Settings;

public class Settings
{
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public string configVersion { get; set; } = "1";

    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public string cassandraIp { get; set; } = "127.0.0.1";

    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int cassandraPort { get; set; } = 9042;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool onlySuperUserLogin { get; set; } = false;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool hideSystemKeySpaces { get; set; } = true;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool countKeyspaceTables { get; set; } = true;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool countTableRows { get; set; } = false;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int captchaMode { get; set; } = 2; //0 = disabled, 1 = always, 2 = only on suspicious logins
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int captchaDifficulty { get; set; } = 4;

    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool fail2Ban { get; set; } = true;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool silentBan { get; set; } = true;
}