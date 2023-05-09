using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class SetKeySpaceViewModel
{
    [Required] public string sessionId { get; set; }

    [Required] public KeySpaceChangeAction action { get; set; }

    [Required] public string keySpaceName { get; set; }

    [Required] public Dictionary<string, string> options { get; set; }
}

public enum KeySpaceChangeAction
{
    Create = 0,
    Rename = 1,
    Delete = 2
}