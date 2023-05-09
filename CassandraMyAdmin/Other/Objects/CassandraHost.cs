namespace CassandraMyAdmin.Other.Objects;

public class CassandraHost
{
    public string HostId { get; set; }
    public string IpAddress { get; set; }
    public string Rack { get; set; }
    public string Version { get; set; }
    public bool IsUp { get; set; }
}