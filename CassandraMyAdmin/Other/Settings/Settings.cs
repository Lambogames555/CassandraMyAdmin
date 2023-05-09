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
    
    //TODO implement pow captcha
    /*[JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool showPowCaptchaOnLogin { get; set; } = false;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int powCaptchaDifficulty { get; set; } = 5;*/
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool hideSystemKeySpaces { get; set; } = true;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool countKeyspaceTables { get; set; } = true;
    
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool countTableRows { get; set; } = false;
}