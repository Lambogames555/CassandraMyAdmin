import './HostArea.css'

import {useEffect} from 'react';


import {useTranslation} from "react-i18next";
import Fetcher from "../../../../Global/Other/Fetcher";

function HostsArea({currentSessionId}) {
    const {t} = useTranslation();

    //TODO set msg box thing (replace "null")
    const {data, isLoading, error, fetchData} = Fetcher([], null, true, '/Cassandra/GetCassandraHosts');

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);

    }, [fetchData, currentSessionId]);

    if (isLoading || data === '') {
        //TODO better loading screen
        return (
            <div className={"empty-window-box"}>
                <h1>Loading...</h1>
            </div>
        )
    }

    if (error) {
        //TODO better error screen
        return (
            <div className={"empty-window-box"}>
                <h1>Error...</h1>
            </div>
        )
    }

    //TODO test with fake data that everything works correctly
    //TODO what do we do when too many hosts are available

    return (
        <div className={"window-box"}>


            <h1>{t("hosts.title")}</h1>


            {
                Object.entries(data).map(([datacenterName, hosts]) => (
                    <div key={datacenterName}>
                        <h1 className={"hosts-datacenter-name"}>{datacenterName}</h1>

                        <table className={"hosts-table"}>

                            <tbody>
                            <tr>
                                <th>{t("hosts.ip")}</th>
                                <th>{t("hosts.id")}</th>
                                <th>{t("hosts.rack")}</th>
                                <th>{t("hosts.version")}</th>
                                <th>{t("hosts.status")}</th>
                            </tr>

                            {
                                hosts.map((host) => (
                                    <tr key={host.hostId}
                                        className={`host-${host.isUp ? "online" : "offline"} hosts-table-row`}>
                                        <td className={"hosts-table-padding"}>{host.ipAddress}</td>
                                        <td>{host.hostId}</td>
                                        <td>{host.rack}</td>
                                        <td>{host.version}</td>
                                        <td>{host.isUp ? t("hosts.online") : t("hosts.offline")}</td>
                                    </tr>
                                ))

                            }
                            </tbody>
                        </table>
                    </div>
                ))
            }
        </div>
    );
}

export default HostsArea;