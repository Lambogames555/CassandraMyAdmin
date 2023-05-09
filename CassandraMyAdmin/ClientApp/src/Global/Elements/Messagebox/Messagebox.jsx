import './Messagebox.css'
import {useTranslation} from "react-i18next";
import CustomButton from "../CustomButton/CustomButton";

import checkIcon from '../../../Resources/GoogleMaterialIcons/check.svg'

function Messagebox({messageBoxTitle, messageBoxText, handleMsgBoxClose}) {
    const {t} = useTranslation();

    return (
        <div className={"messagebox"}>
            <div className={"messagebox-inner"}>
                <div className={"messagebox-title"}>
                    <h1>{messageBoxTitle}</h1>
                    <hr/>
                </div>

                <div className={"messagebox-text-box"}>
                    <p>{messageBoxText}</p>
                </div>

                <div className={"messagebox-bottom"}>
                    <CustomButton text={t("messageBox.ok")} icon={checkIcon} isActive={false}
                                  onClick={() => handleMsgBoxClose()}/>
                </div>
            </div>
        </div>
    );
}

export default Messagebox;