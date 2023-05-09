using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class GetTableDataViewModel
{
    [Required] public string sessionId { get; set; }

    [Required] public GetTableDataAction action { get; set; }

    [Required] public string keySpaceName { get; set; }

    [Required] public string tableName { get; set; }

    [Required] public Dictionary<string, string> options { get; set; }
}

public enum GetTableDataAction
{
    ColumNames = 0,
    Rows = 1
}