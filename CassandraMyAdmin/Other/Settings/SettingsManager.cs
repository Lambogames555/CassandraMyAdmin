using Newtonsoft.Json;

namespace CassandraMyAdmin.Other.Settings;

public class SettingsManager
{
    const string settingsFileName = "settings.json";

    public static void ManageSettings()
    {
        // Check if the settings file exists
        if (File.Exists(settingsFileName))
        {
            // If the file exists, read its contents into a string
            var fileContent = File.ReadAllText(settingsFileName);

            // Deserialize the JSON string into a Settings object and set it as the current application settings
            Globals.Settings = JsonConvert.DeserializeObject<Settings>(fileContent);
        }
        else
        {
            // If the file doesn't exist, create a new Settings object and set it as the current application settings
            Globals.Settings = new Settings();
        }
        
        
        // Serialize the new Settings object into a JSON string
        var settingsJsonString = JsonConvert.SerializeObject(Globals.Settings, Formatting.Indented);

        // Write the JSON string to the settings file
        File.WriteAllText(settingsFileName, settingsJsonString);
    }
}