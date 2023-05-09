import './TablesArea.css'

import {useEffect, useState} from 'react';

import {useTranslation} from "react-i18next";
import LoadingPopup from "../../../../../LoadingPopup/LoadingPopup";
import CreateTableArea from "./CreateTableArea/CreateTableArea";
import Fetcher from "../../../../../Global/Other/Fetcher";
import FetchOnlyPopup from "../../../../../Global/Popups/FetchOnlyPopup";
import TableViewerArea from "./TableViewerArea/TableViewerArea";
import CustomButton from "../../../../../Global/Elements/CustomButton/CustomButton";
import Messagebox from "../../../../../Global/Elements/Messagebox/Messagebox";
import DropdownMenu from "../../../../../Global/Elements/DropdownMenu/DropdownMenu";

import arrowBackIcon from '../../../../../Resources/GoogleMaterialIcons/arrowback.svg'
import addIcon from '../../../../../Resources/GoogleMaterialIcons/add.svg'


function TablesArea({currentSessionId, openKeySpace, handleClose}) {
    const {t} = useTranslation();

    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxTitle, setMessageBoxTitle] = useState('');
    const [messageBoxText, setMessageBoxText] = useState('');

    const {data, isLoading, error, fetchData} = Fetcher([], showMsgBox, true, '/Cassandra/GetCassandraKeySpaceTables');

    const [activePopup, setActivePopup] = useState(0);

    const [requestData, setRequestData] = useState({});

    useEffect(() => {
        const requestData = {
            keySpaceName: openKeySpace
        }

        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId, requestData);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId]);

    // TODO the "index" system is bad -> make this better
    function onDropDownClicked(currentTableName, index) {
        setActivePopupValue(currentTableName, index + 3);
    }

    function setActivePopupValue(currentTableName, index) {
        if (index > 2) {
            if (!window.confirm(t("confirmBoxText"))) {
                return;
            }
        }

        setActivePopup(index);

        setRequestData({
            action: index - 2,
            sessionId: currentSessionId,
            tableName: currentTableName,
            keySpaceName: openKeySpace,
            options: {}
        });
    }

    function handlePopupClose() {
        setActivePopup(0)

        // TODO dont refresh when cancel button is clicked

        const requestData = {
            keySpaceName: openKeySpace
        }

        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId, requestData);
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


    if (activePopup === 1) {
        return (
            <div>
                <TableViewerArea
                    currentSessionId={currentSessionId}
                    currentKeySpace={openKeySpace}
                    currentTable={requestData.tableName}
                    showMsgBox={showMsgBox}
                    handleClose={handlePopupClose}
                    handleMsgBoxClose={() => setShowMessageBox(false)}
                />

                {showMessageBox ? (
                    <Messagebox
                        messageBoxTitle={messageBoxTitle}
                        messageBoxText={messageBoxText}
                        handleMsgBoxClose={() => setShowMessageBox(false)}
                    />
                ) : (
                    <></>
                )}
            </div>
        );
    }

    if (activePopup === 2) {
        return (
            <div>
                <CreateTableArea
                    currentSessionId={currentSessionId}
                    currentKeySpace={openKeySpace}
                    showMsgBox={showMsgBox}
                    handleClose={handlePopupClose}
                />

                {showMessageBox ? (
                    <Messagebox
                        messageBoxTitle={messageBoxTitle}
                        messageBoxText={messageBoxText}
                        handleMsgBoxClose={() => setShowMessageBox(false)}
                    />
                ) : (
                    <></>
                )}
            </div>
        );
    }
    
    return (
        <div className={"window-box scrollbar"}>

            <h1>{t("tables.title", {keySpaceName: openKeySpace})}</h1>

            <div className={"tables-button-box"}>
                {
                    // TODO dont use the menu button, make this better or rename this button to a "normal" button
                }
                <CustomButton text={t("tables.back")} icon={arrowBackIcon} isActive={false}
                              onClick={() => handleClose()}/>
                <CustomButton text={t("tables.createTable")} icon={addIcon} isActive={false}
                              onClick={() => setActivePopupValue(null, 2)}/>
            </div>


            {
                Object.keys(data).length > 0 ? (
                    <ul className={"tables-list"}>
                        {Object.keys(data).map((key) => (
                            <li key={key}>
                                <div>
                                    <button className={"tables-button"} onClick={() => setActivePopupValue(key, 1)}>
                                        {key}
                                    </button>
                                    {
                                        data[key] !== -1 && <span className={"tables-tableInfo"}>({data[key]} {t("tables.rows")})</span>
                                    }
                                </div>

                                {
                                    // TODO edit table
                                }
                                <DropdownMenu data={key}
                                              buttonList={["tables.clear", "tables.delete"]}
                                              onItemSelected={onDropDownClicked}/>

                            </li>
                        ))}
                    </ul>
                ) : (
                    // TODO make font bigger
                    <p className={"text-center"}>{t("tables.nothingFound")}</p>
                )
            }


            {
                activePopup > 2 &&
                <FetchOnlyPopup currentSessionId={currentSessionId}
                                requestData={requestData}
                                requestUrl={"/Cassandra/SetTable"}
                                showMsgBox={showMsgBox}
                                closeCallBack={handlePopupClose}/>
            }


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

export default TablesArea;