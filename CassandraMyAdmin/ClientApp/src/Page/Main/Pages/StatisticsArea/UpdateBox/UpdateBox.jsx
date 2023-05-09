import './UpdateBox.css'
import {useTranslation} from "react-i18next";
import Fetcher from "../../../../../Global/Other/Fetcher";
import {useEffect} from "react";

import questionMarkIcon from '../../../../../Resources/GoogleMaterialIcons/questionmark.svg'
import closeIcon from '../../../../../Resources/GoogleMaterialIcons/close.svg'
import checkCircleIcon from '../../../../../Resources/GoogleMaterialIcons/checkcircle.svg'
import warningIcon from '../../../../../Resources/GoogleMaterialIcons/checkcircle.svg'

function UpdateBox({currentSessionId}) {
    const {t} = useTranslation();
    
    const {data, isLoading, error, fetchData} = Fetcher({}, null, true, '/Cassandra/GetUpdateInfo');


    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId]);

    if (error) {
        return (
            <div className={"update-box"}>
                <div className={"update-box-icon red"}>
                    <img src={closeIcon} alt={""}/>
                </div>
                <h3>{t("updateBox.updateCheckError")}</h3>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className={"update-box"}>
                <div className={"update-box-icon gray"}>
                    <img src={questionMarkIcon} alt={""}/>
                </div>
                <h3>{t("updateBox.updateCheck")}</h3>
            </div>
        );   
    }
    
    if (data.TagName === data.CurrentVersion) {
        return (
            <div className={"update-box"}>
                <div className={"update-box-icon green"}>
                    <img src={checkCircleIcon} alt={""}/>
                </div>
                <h3>{t("updateBox.noUpdateFound")}</h3>
            </div>
        );
    }
    
    return (
        <div className={"update-box"}>
            <div className={"update-box-icon orange"}>
                <img src={warningIcon} alt={""}/>
            </div>
            <h3><a href={data.HtmlUrl}  target={"_blank"} rel={"noopener noreferrer"}>{t("updateBox.updateFound", { updateName: data.Name, updateTag: data.TagName})}</a></h3>
        </div>
    );
    
}

export default UpdateBox;