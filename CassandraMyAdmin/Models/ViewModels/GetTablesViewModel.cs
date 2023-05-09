using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class GetTablesViewModel
{
    [Required] public string sessionId { get; set; }


    [Required] public string keySpaceName { get; set; }
}