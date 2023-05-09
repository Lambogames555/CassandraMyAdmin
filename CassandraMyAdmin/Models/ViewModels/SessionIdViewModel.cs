using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class SessionIdViewModel
{
    [Required] public string sessionId { get; set; }
}