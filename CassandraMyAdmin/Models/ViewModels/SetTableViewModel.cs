using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class SetTableViewModel
{
    [Required] public string sessionId { get; set; }

    [Required] public TableChangeAction action { get; set; }

    [Required] public string keySpaceName { get; set; }

    [Required] public string tableName { get; set; }

    [Required] public Dictionary<string, string> options { get; set; }
}

public enum TableChangeAction
{
    Create = 0,
    Clear = 1,
    Delete = 2,
    Rename = 3
}