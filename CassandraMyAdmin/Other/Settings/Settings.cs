using System.ComponentModel;
using Newtonsoft.Json;

namespace CassandraMyAdmin.Other.Settings;

public class Settings
{
    [DefaultValue("1")]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public string configVersion { get; set; }

    [DefaultValue("127.0.0.1")]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public string cassandraIp { get; set; }

    [DefaultValue(9042)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int cassandraPort { get; set; }
    
    [DefaultValue(false)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool onlySuperUserLogin { get; set; }
    
    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool hideSystemKeySpaces { get; set; }

    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool countKeyspaceTables { get; set; }

    [DefaultValue(false)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public bool countTableRows { get; set; }
    
    [DefaultValue(2)] //0 = disabled, 1 = always, 2 = only on suspicious logins
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int captchaMode { get; set; }
    
    [DefaultValue(4)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
    public int captchaDifficulty { get; set; }

    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool fail2Ban { get; set; }
    
    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool silentBan { get; set; }
}