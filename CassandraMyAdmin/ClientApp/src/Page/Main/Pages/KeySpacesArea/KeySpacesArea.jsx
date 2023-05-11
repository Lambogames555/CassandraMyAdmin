import './KeySpacesArea.css'

import {useEffect, useState} from 'react';

import {useTranslation} from "react-i18next";
import LoadingPopup from "../../../../LoadingPopup/LoadingPopup";
import CreateKeySpacePopup from "./Popups/CreateKeySpacePopup";
import TablesArea from "./TablesArea/TablesArea";
import Fetcher from "../../../../Global/Other/Fetcher";
import FetchOnlyPopup from "../../../../Global/Popups/FetchOnlyPopup";
import CustomButton from "../../../../Global/Elements/CustomButton/CustomButton";
import Messagebox from "../../../../Global/Elements/Messagebox/Messagebox";

import addIcon from '../../../../Resources/GoogleMaterialIcons/add.svg'
import deleteIcon from '../../../../Resources/GoogleMaterialIcons/delete.svg'

function KeySpacesArea({currentSessionId}) {
    const {t} = useTranslation();

    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxTitle, setMessageBoxTitle] = useState('');
    const [messageBoxText, setMessageBoxText] = useState('');

    const {data, isLoading, error, fetchData} = Fetcher([], showMsgBox, true, '/Cassandra/GetCassandraKeySpaces');
    const [activePopup, setActivePopup] = useState(0);

    const [currentKeySpaceName, setCurrentKeySpaceName] = useState('');

    const [openKeySpace, setOpenKeySpace] = useState(null);
    const [requestData, setRequestData] = useState({});

    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId]);

    function setActivePopupValue(currentKeySpaceItem, index) {
        setCurrentKeySpaceName(currentKeySpaceItem);

        if (index > 1) {
            if (!window.confirm(t("confirmBoxText"))) {
                return;
            }
        }
        
        setRequestData({
            action: index,
            keySpaceName: currentKeySpaceItem,
            options: {}
        });
        
        setActivePopup(index);
    }

    function handlePopupClose() {
        setActivePopup(0)

        // TODO dont refresh when cancel button is clicked
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);
    }

    function showMsgBox(title, text) {
        setShowMessageBox(true);
        setMessageBoxTitle(title)
        setMessageBoxText(text);
    }

    if (isLoading) {
        return (
            <LoadingPopup/>
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

    //TODO scrollbar for keyspaces and tables

    if (openKeySpace !== null) {
        //TODO rename TablesArea to Keyspaceviewer?
        return <TablesArea currentSessionId={currentSessionId} openKeySpace={openKeySpace}
                           handleClose={() => setOpenKeySpace(null)}></TablesArea>
    }

    return (
        <div className={"window-box scrollbar"}>

            <h1>{t("keySpaces.title")}</h1>

            {
                Object.keys(data).length > 0 ? (
                    <ul className={"keyspaces-list"}>


                        <li>
                            <div>
                                <button className={"keyspaces-button"} onClick={() => setActivePopupValue(null, 1)}>
                                    <img src={addIcon} alt={""}/>
                                    {t("keySpaces.createKeySpace")}
                                </button>
                            </div>

                            <input
                                type="text"
                                className={"popup-textbox"}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name"
                            />
                        </li>
                        
                        
                        {Object.keys(data).filter((key) =>
                            key.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((key) => (
                            <li key={key}>
                                <div>
                                    <button className={"keyspaces-button"} onClick={() => setOpenKeySpace(key)}>
                                        {key}
                                    </button>
                                    {
                                        data[key] !== -1 && <span className={"keyspaces-tableInfo"}>({data[key]} {t("keySpaces.tables")})</span>   
                                    }
                                </div>
                                <button className={"keyspaces-delete-button"}
                                        onClick={() => setActivePopupValue(key, 2)}>
                                    <img src={deleteIcon} alt={""}/>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (

                    // TODO make font bigger
                    <p className={"text-center"}>{t("keySpaces.nothingFound")}</p>
                )
            }


            {activePopup === 1 && <CreateKeySpacePopup currentSessionId={currentSessionId} showMsgBox={showMsgBox}
                                                       closeCallBack={handlePopupClose}/>}
            {activePopup > 1 && <FetchOnlyPopup currentSessionId={currentSessionId} requestData={requestData}
                                                requestUrl={"/Cassandra/SetKeySpace"} showMsgBox={showMsgBox}
                                                closeCallBack={handlePopupClose}/>}


            {
                showMessageBox ?
                    <Messagebox messageBoxTitle={messageBoxTitle} messageBoxText={messageBoxText}
                                handleMsgBoxClose={() => setShowMessageBox(false)}/>
                    :
                    null
            }

            {
                isLoading ?
                    <LoadingPopup/>
                    :
                    null
            }


        </div>
    );
}

export default KeySpacesArea;