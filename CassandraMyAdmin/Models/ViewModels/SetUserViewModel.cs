using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class SetUserViewModel
{
    [Required] public string sessionId { get; set; }

    [Required] public UserChangeAction action { get; set; }

    [Required] public string username { get; set; }

    [Required] public Dictionary<string, string> options { get; set; }
}

public enum UserChangeAction
{
    Rename = 0,
    Promote = 1,
    Demote = 2,
    Delete = 3,
    Create = 4
}