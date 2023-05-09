import './LoadingPopup.css'

import {useTranslation} from "react-i18next";

// TODO move to global?
function LoadingPopup() {
    const {t} = useTranslation();

    return (
        <div className={"loadingPopup"}>
            <div className={"loadingPopup-inner"}>
                <div className={"loadingPopup-title"}>
                    <h1>{t("loadingPopup.pleaseWait")}</h1>
                    <hr/>
                </div>

                <div className={"loadingPopup-loader-box center"}>
                    <div className="loadingPopup-loader"></div>
                </div>

            </div>
        </div>
    );
}

export default LoadingPopup;