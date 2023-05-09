import '../../../../../Global/css/Popup.css'
import {useTranslation} from "react-i18next";
import {useState} from "react";
import LoadingPopup from "../../../../../LoadingPopup/LoadingPopup";
import Fetcher from "../../../../../Global/Other/Fetcher";
import CustomButton from "../../../../../Global/Elements/CustomButton/CustomButton";

import closeIcon from '../../../../../Resources/GoogleMaterialIcons/close.svg'
import addIcon from '../../../../../Resources/GoogleMaterialIcons/add.svg'


function CreateUserPopup({currentSessionId, showMsgBox, closeCallBack}) {
    const {t} = useTranslation();

    const {isLoading, fetchData} = Fetcher('', showMsgBox, false, '/Cassandra/SetUser');


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [isSuperUser, setIsSuperUser] = useState(false);


    const onChangeHandler = (event, stateVariable) => {
        stateVariable(event.target.value);
    }

    async function handleContinueButtonClick() {
        if (!username) {
            showMsgBox(t("messageBox.warning"), t("createUserPopup.noUsername"))
            return;
        }

        const cassandraRegex = new RegExp('[;&\'"]');

        if (cassandraRegex.test(username) || cassandraRegex.test(password)) {
            showMsgBox(t("messageBox.warning"), t("createUserPopup.usernamePasswordContainsForbiddenCharacters"))
            return;
        }


        if (!password) {
            showMsgBox(t("messageBox.warning"), t("createUserPopup.noPassword"))
            return;
        }

        if (password !== retypePassword) {
            showMsgBox(t("messageBox.warning"), t("createUserPopup.notTheSamePasswords"))
            return;
        }

        // noinspection JSIncompatibleTypesComparison
        const requestData = {
            action: 4,
            username: username,
            options: {
                password: password,
                asSuperUser: (isSuperUser === "on").toString()
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
                    <h1>{t("createUserPopup.title")}</h1>
                    <hr/>
                </div>

                <div className={"popup-body"}>
                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("createUserPopup.newUsername")}
                        </label>
                        <input
                            type="text"
                            className="popup-textbox"
                            onChange={(event) => onChangeHandler(event, setUsername)}
                        />
                    </div>

                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("createUserPopup.newPassword")}
                        </label>
                        <input
                            type="password"
                            className="popup-textbox"
                            onChange={(event) => onChangeHandler(event, setPassword)}
                        />
                    </div>

                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("createUserPopup.retypeNewPassword")}
                        </label>
                        <input
                            type="password"
                            className="popup-textbox"
                            onChange={(event) => onChangeHandler(event, setRetypePassword)}
                        />
                    </div>

                    <div className={"popup-input-box"}>
                        <label className={"popup-checkbox-container"}>
                            <input
                                type="checkbox"
                                onChange={(event) => onChangeHandler(event, setIsSuperUser)}
                            />
                            <span className={"popup-checkbox"}></span>
                            {t("createUserPopup.superUser")}
                        </label>
                    </div>
                </div>


                <div className={"popup-bottom"}>
                    <CustomButton text={t("popup.cancel")} icon={closeIcon} isActive={false}
                                  onClick={handleCancelButtonClick}/>
                    <CustomButton text={t("popup.continue")} icon={addIcon} isActive={false}
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

export default CreateUserPopup;