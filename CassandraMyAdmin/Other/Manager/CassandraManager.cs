using System.Diagnostics;
using Cassandra;
using Cassandra.Mapping;
using ISession = Cassandra.ISession;

namespace CassandraMyAdmin.Other.Manager;

public class CassandraManager : IDisposable
{
    private readonly Cluster _cluster;
    //private readonly IMapper _mapper;
    private readonly ISession? _session;
    private readonly string _username;
    private readonly int _errorCode = -1;

    public CassandraManager(string username, string password)
    {
        // Set the username of the current user
        _username = username;
        
        // Input string containing comma-separated IP addresses
        string ipAddressString = Globals.Settings.cassandraIp;
        
        string[] ipAddresses;

        // Check if input string contains a comma separator
        if (ipAddressString.Contains(","))
        {
            // If the input string contains a comma, split it into an array of IP addresses
            ipAddresses = ipAddressString.Split(',');
        }
        else
        {
            // If the input string doesn't contain a comma, assume there is only one IP address and create an array with that single IP address
            ipAddresses = new string[] { ipAddressString };
        }

        // Set up authentication options for the Cluster object
        var authProvider = new PlainTextAuthProvider(username, password);

        //TODO .WithMetrics(null, new DriverMetricsOptions().SetEnabledSessionMetrics(SessionMetric.AllSessionMetrics))
        // Set up a Cluster object with the Cassandra cluster details and authentication options
        _cluster = Cluster.Builder()
            .AddContactPoints(ipAddresses)
            .WithPort(Globals.Settings.cassandraPort)
            .WithAuthProvider(authProvider)
            .Build();

        // Create a session object from the cluster object
        try
        {
            _session = _cluster.Connect();
        }
        catch (NoHostAvailableException exception)
        {
            if (exception.Message.Contains("AuthenticationException"))
            {
                // Set the error code to "Authentication failed"
                _errorCode = 401;
            }
            else
            {
                // Set the error code to "Service Unavailable"
                _errorCode = 503;   
            }
        }
        catch (Exception)
        {
            // Set the error code to "Internal Server Error"
            _errorCode = 500;
        }
        

        // Create a mapper object from the session object
        //_mapper = new Mapper(_session);
    }

    public void Dispose()
    {
        // dispose the session and cluster objects
        _session?.Dispose();
        _cluster.Dispose();
    }

    public ISession? GetSession()
    {
        return _session;
    }

    /*public IMapper GetMapper()
    {
        return _mapper;
    }*/

    public Cluster GetCluster()
    {
        return _cluster;
    }

    public string GetUsername()
    {
        return _username;
    }

    public int GetErrorCode()
    {
        return _errorCode;
    }
}