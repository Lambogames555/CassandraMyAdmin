namespace CassandraMyAdmin.Other.Objects;

public class Permissions
{
    public string resourceName { get; set; }
    public string resourceNameValue { get; set; }
    public List<string> privilege { get; set; }
}