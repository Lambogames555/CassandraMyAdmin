using System.ComponentModel.DataAnnotations;

namespace CassandraMyAdmin.Models.ViewModels;

public class ConnectToCassandraViewModel
{
    [Required] public string username { get; set; }

    [Required] public string password { get; set; }
    
    // Captcha solution
    public string solution { get; set; }
}