import './MenuArea.css'

import {useTranslation} from "react-i18next";
import {useState} from 'react';
import {useNavigate} from "react-router-dom";
import {removeCookie} from "../../../Global/Other/CookieManager";

import CustomButton from "../../../Global/Elements/CustomButton/CustomButton";


import monitoringIcon from '../../../Resources/GoogleMaterialIcons/monitoring.svg'
import dnsIcon from '../../../Resources/GoogleMaterialIcons/dns.svg'
import databaseIcon from '../../../Resources/GoogleMaterialIcons/database.svg'
import groupIcon from '../../../Resources/GoogleMaterialIcons/group.svg'
import questionMarkIcon from '../../../Resources/GoogleMaterialIcons/questionmark.svg'
import logoutIcon from '../../../Resources/GoogleMaterialIcons/logout.svg'


function MenuArea({setCurrentPageValue}) {
    let navigate = useNavigate();

    const {t} = useTranslation();

    const [activeButton, setActiveButton] = useState(0);


    const buttons = [
        {text: t("menuButton.statistics"), icon: monitoringIcon},
        {text: t("menuButton.hosts"), icon: dnsIcon},
        {text: t("menuButton.keySpaces"), icon: databaseIcon},
        {text: t("menuButton.users"), icon: groupIcon},
        {text: t("menuButton.about"), icon: questionMarkIcon},
        {text: t("menuButton.logout"), icon: logoutIcon},
    ];

    const handleButtonClick = (index) => {
        if (index === buttons.length - 1) {
            removeCookie("sessionId");
            navigate("login");
            return;
        }

        setActiveButton(index);
        setCurrentPageValue(index);
    };

    return (
        <div className={"menu-box"}>


            <div className={"menu-header"}>
                <h1 className={"cassandra-my-admin-title"}>Cassandra<span style={{color: "#FF7889"}}>MyAdmin</span></h1>
            </div>

            <ul className={"menu-list"}>
                {buttons.map((button, index) => (
                    <li key={index}>
                        <CustomButton
                            text={button.text}
                            icon={button.icon}
                            isActive={activeButton === index}
                            onClick={() => handleButtonClick(index)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MenuArea;
