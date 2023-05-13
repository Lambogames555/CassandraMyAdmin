using System.ComponentModel;
using Newtonsoft.Json;

namespace CassandraMyAdmin.Other.Settings;

public class Settings
{
    [DefaultValue("1")]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public string configVersion { get; set; } = "1";
    
    [DefaultValue("127.0.0.1")]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public string cassandraIp { get; set; } = "127.0.0.1";
    
    [DefaultValue(9042)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public int cassandraPort { get; set; } = 9042;

    [DefaultValue(false)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool onlySuperUserLogin { get; set; } = false;

    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool hideSystemKeySpaces { get; set; } = true;

    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool countKeyspaceTables { get; set; } = true;

    [DefaultValue(false)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool countTableRows { get; set; } = false;

    [DefaultValue(2)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public int captchaMode { get; set; } = 2; //0 = disabled, 1 = always, 2 = only on suspicious logins

    [DefaultValue(4)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public int captchaDifficulty { get; set; } = 4;

    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool fail2Ban { get; set; } = true;

    [DefaultValue(true)]
    [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate, NullValueHandling = NullValueHandling.Ignore)]
    public bool silentBan { get; set; } = true;
}