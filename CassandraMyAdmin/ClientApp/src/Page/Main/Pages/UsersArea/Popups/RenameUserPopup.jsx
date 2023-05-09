import '../../../../../Global/css/Popup.css'

import {useState} from "react";
import {useTranslation} from "react-i18next";
import LoadingPopup from "../../../../../LoadingPopup/LoadingPopup";

import Fetcher from "../../../../../Global/Other/Fetcher";
import CustomButton from "../../../../../Global/Elements/CustomButton/CustomButton";

import closeIcon from '../../../../../Resources/GoogleMaterialIcons/close.svg'
import editIcon from '../../../../../Resources/GoogleMaterialIcons/edit.svg'

function RenameUserPopup({currentSessionId, showMsgBox, currentUsername, closeCallBack}) {
    const {t} = useTranslation();


    const {isLoading, fetchData} = Fetcher('', showMsgBox, false, '/Cassandra/SetUser');

    const [newUsername, setNewUsername] = useState('');

    const onChangeHandler = (event, stateVariable) => {
        stateVariable(event.target.value);
    }

    async function handleContinueButtonClick() {
        if (!newUsername) {
            showMsgBox(t("messageBox.warning"), t("renameUserPopup.noUsername"))
            return;
        }


        const cassandraRegex = new RegExp('[;&\'"]');

        if (cassandraRegex.test(newUsername)) {
            showMsgBox(t("messageBox.warning"), t("renameUserPopup.usernameContainsForbiddenCharacters"))
            return;
        }


        // noinspection JSIncompatibleTypesComparison
        const requestData = {
            action: 0,
            username: currentUsername,
            options: {
                newUsername: newUsername,
            }
        }

        await fetchData(currentSessionId, requestData);

        closeCallBack();
    }

    function handleCancelButtonClick() {
        closeCallBack();
    }

    return (
        <div className="popup">
            <div className="popup-inner">
                <div className={"popup-title"}>
                    <h1>{t("renameUserPopup.title")}</h1>
                    <hr/>
                </div>

                <div className={"popup-body"}>
                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("renameUserPopup.newUsername")}
                        </label>
                        <input
                            type="text"
                            className="popup-textbox"
                            defaultValue={currentUsername}
                            onChange={(event) => onChangeHandler(event, setNewUsername)}
                        />
                    </div>
                </div>


                <div className={"popup-bottom"}>
                    <CustomButton text={t("popup.cancel")} icon={closeIcon} isActive={false}
                                  onClick={handleCancelButtonClick}/>
                    <CustomButton text={t("popup.continue")} icon={editIcon} isActive={false}
                                  onClick={handleContinueButtonClick}/>
                </div>
            </div>

            {
                isLoading ?
                    <LoadingPopup/>
                    :
                    null
            }

        </div>
    );
}

export default RenameUserPopup;