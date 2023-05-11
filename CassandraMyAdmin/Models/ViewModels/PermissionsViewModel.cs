using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class PermissionsViewModel
{
    [Required] public string sessionId { get; set; }
    [Required] public PermissionsAction action { get; set; }

    [Required] public string username { get; set; }

    [Required] public Dictionary<string, object> options { get; set; }
}

public enum PermissionsAction
{
    Get = 0,
    Set = 1,
}