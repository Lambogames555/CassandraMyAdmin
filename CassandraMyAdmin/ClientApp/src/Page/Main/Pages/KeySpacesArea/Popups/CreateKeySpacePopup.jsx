import '../../../../../Global/css/Popup.css'

import {useState} from "react";
import {useTranslation} from "react-i18next";

import LoadingPopup from "../../../../../LoadingPopup/LoadingPopup";
import Fetcher from "../../../../../Global/Other/Fetcher";
import CustomButton from "../../../../../Global/Elements/CustomButton/CustomButton";

import closeIcon from '../../../../../Resources/GoogleMaterialIcons/close.svg'
import checkIcon from '../../../../../Resources/GoogleMaterialIcons/check.svg'

function CreateKeySpacePopup({currentSessionId, showMsgBox, closeCallBack}) {
    const {t} = useTranslation();

    const {isLoading, fetchData} = Fetcher('', showMsgBox, false, '/Cassandra/SetKeySpace');

    const [newKeySpaceName, setNewKeySpaceName] = useState('');

    const [mewReplicationFactor, setNewReplicationFactor] = useState('1');


    async function handleContinueButtonClick() {
        if (!newKeySpaceName) {
            showMsgBox(t("messageBox.warning"), t("createKeySpacePopup.noKeySpaceName"))
            return;
        }


        const cassandraRegex = new RegExp('[;&\'"]');

        if (cassandraRegex.test(newKeySpaceName)) {
            showMsgBox(t("messageBox.warning"), t("createKeySpacePopup.keySpaceNameContainsForbiddenCharacters"))
            return;
        }


        // noinspection JSIncompatibleTypesComparison
        const requestData = {
            action: 0,
            keySpaceName: newKeySpaceName,
            options: {
                replicationFactor: mewReplicationFactor.toString(),
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
                    <h1>{t("createKeySpacePopup.title")}</h1>
                    <hr/>
                </div>

                <div className={"popup-body"}>
                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("createKeySpacePopup.newKeyspaceName")}
                        </label>
                        <input
                            type="text"
                            className="popup-textbox"
                            onChange={(event) => setNewKeySpaceName(event.target.value)}
                        />
                    </div>

                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("createKeySpacePopup.replication")}
                        </label>
                        <select className={"popup-dropdown"}>
                            <option value="SimpleStrategy">{t("createKeySpacePopup.simpleStrategy")}</option>
                            <option value="NetworkTopologyStrategy"
                                    disabled>{t("createKeySpacePopup.networkTopologyStrategy")} ({t("workInProcess")})
                            </option>
                        </select>
                    </div>

                    <div className={"popup-input-box"}>
                        <label className="popup-label">
                            {t("createKeySpacePopup.replicationFactor")}
                        </label>
                        <input
                            type="text"
                            className="popup-textbox"
                            defaultValue={"1"}
                            onChange={(event) => setNewReplicationFactor(event.target.value)}
                        />
                    </div>
                </div>


                <div className={"popup-bottom"}>
                    <CustomButton text={t("popup.cancel")} icon={closeIcon} isActive={false}
                                  onClick={handleCancelButtonClick}/>
                    <CustomButton text={t("popup.continue")} icon={checkIcon} isActive={false}
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

export default CreateKeySpacePopup;