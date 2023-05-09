import './StatisticsArea.css'

import {useEffect} from 'react';


import {useTranslation} from "react-i18next";

import Fetcher from "../../../../Global/Other/Fetcher";


import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import {faker} from '@faker-js/faker';
import StatisticsBox from "./StatisticsBox/StatisticsBox";

import databaseFilledIcon from '../../../../Resources/GoogleMaterialIcons/database_filled.svg'
import groupFilledIcon from '../../../../Resources/GoogleMaterialIcons/group_filled.svg'
import downloadFilledIcon from '../../../../Resources/GoogleMaterialIcons/download_filled.svg'
import vpnKeyFilledIcon from '../../../../Resources/GoogleMaterialIcons/vpnkey_filled.svg'
import UpdateBox from "./UpdateBox/UpdateBox";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Example Bar',
        },
    },
};

function StatisticsArea({currentSessionId}) {
    const {t} = useTranslation();

    //TODO set msg box thing (replace "null")
    const {data, isLoading, error, fetchData} = Fetcher({}, null, true, '/Cassandra/GetCassandraStatistics');

    const barData = {
        labels,
        datasets: [
            {
                label: 'Example Label 1',
                data: labels.map(() => faker.datatype.number({min: 0, max: 1000})),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Example Label 2',
                data: labels.map(() => faker.datatype.number({min: 0, max: 1000})),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };


    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId]);

    if (isLoading) {
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


    return (
        <div className={"empty-window-box"}>
            <h1 className={"statistics-greeting-text"}>{t('statistics.greeting', {
                username: data.username,
                clusterName: data.clusterName
            })}</h1>
            
            <div className={"statistics-box"}>
                <StatisticsBox text={"wip"} value={"N/A"} textBottom={"lifetime"} faIcon={databaseFilledIcon}
                               color={"#2DC4D0"} color2={"#23779F"}/>
                <StatisticsBox text={"wip"} value={"N/A"} textBottom={"lifetime"} faIcon={groupFilledIcon}
                               color={"#E8836B"} color2={"#B15572"}/>
                <StatisticsBox text={"wip"} value={"N/A"} textBottom={"lifetime"} faIcon={downloadFilledIcon}
                               color={"#FBC806"} color2={"#BE7542"}/>
                <StatisticsBox text={"wip"} value={"N/A"} textBottom={"lifetime"} faIcon={vpnKeyFilledIcon}
                               color={"#847FEA"} color2={"#884DCC"}/>
            </div>


            <UpdateBox currentSessionId={currentSessionId}/>


            <div className={"statistics-area"}>
                <Bar options={options} data={barData}/>
            </div>
        </div>
    );
}

export default StatisticsArea;