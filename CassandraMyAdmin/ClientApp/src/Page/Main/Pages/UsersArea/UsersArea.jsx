import './UserArea.css'

import {useEffect, useState} from 'react';


import {useTranslation} from "react-i18next";
import CreateUserPopup from "./Popups/CreateUserPopup";
import RenameUserPopup from "./Popups/RenameUserPopup";
import Fetcher from "../../../../Global/Other/Fetcher";
import FetchOnlyPopup from "../../../../Global/Popups/FetchOnlyPopup";
import DropdownMenu from "../../../../Global/Elements/DropdownMenu/DropdownMenu";
import CustomButton from "../../../../Global/Elements/CustomButton/CustomButton";
import Messagebox from "../../../../Global/Elements/Messagebox/Messagebox";
import LoadingPopup from "../../../../LoadingPopup/LoadingPopup";

import groupAddIcon from '../../../../Resources/GoogleMaterialIcons/groupadd.svg'
import PermissionsArea from "./PermissionsArea/PermissionsArea";

function UsersArea({currentSessionId}) {
    const {t} = useTranslation();

    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxTitle, setMessageBoxTitle] = useState('');
    const [messageBoxText, setMessageBoxText] = useState('');

    const {data, isLoading, error, fetchData} = Fetcher([], showMsgBox, true, '/Cassandra/GetCassandraUsers');

    const [activePopup, setActivePopup] = useState(0);
    const [activeUsername, setActiveUsername] = useState('');

    const [requestData, setRequestData] = useState({});

    const [searchQuery, setSearchQuery] = useState("");
    
    const UsersDropDownMenuEnum = {
        Rename: 0,
        Promote: 1,
        Demote: 2,
        Delete: 3,
        Permissions: 4,
    }
    
    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId]);

    function showMsgBox(title, text) {
        setShowMessageBox(true);
        setMessageBoxTitle(title)
        setMessageBoxText(text);
    }

    function handlePopupClose() {
        setActivePopup(0)

        // TODO dont refresh when cancel button is clicked
        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId);
    }

    if (isLoading || data === '') {
        return (
            <LoadingPopup/>
        )
    }

    if (error) {
        // TODO better error screen
        return (
            <div className={"empty-window-box"}>
                <h1>Error...</h1>
            </div>
        )
    }

    function onDropDownClicked(user, enumNumber) {

        switch (enumNumber) {
            case UsersDropDownMenuEnum.Rename:
                
                // Set username for the popup
                setActiveUsername(user.username);

                // Show rename user popup
                setActivePopup(2);
                
                break;

            case UsersDropDownMenuEnum.Promote:
            case UsersDropDownMenuEnum.Demote:
            case UsersDropDownMenuEnum.Delete:

                if (!window.confirm(t("confirmBoxText"))) {
                    return;
                }
                
                // Set the request data
                setRequestData({
                    action: enumNumber,
                    username: user.username,
                    options: {},
                });

                setActivePopup(3);
                
                break;
                
            case UsersDropDownMenuEnum.Permissions:
                
                // Set username for the popup
                setActiveUsername(user.username);
                
                setActivePopup(4);

                break;
        }
        
    }
    
    if (activePopup === 4)
        return (
            <>
                <PermissionsArea
                    currentUsername={activeUsername}
                    currentSessionId={currentSessionId}
                    handleClose={handlePopupClose}
                    showMsgBox={showMsgBox}/>

                {
                    showMessageBox ?
                        <Messagebox messageBoxTitle={messageBoxTitle} messageBoxText={messageBoxText}
                                    handleMsgBoxClose={() => setShowMessageBox(false)}/>
                        :
                        null
                }
            </>
          
        );

    return (
        <div className={"window-box scrollbar"}>


            <h1>{t("users.title")}</h1>


            <div className={"users-button-box"}>
                <CustomButton text={t("users.createUser")} icon={groupAddIcon} isActive={false}
                              onClick={() => setActivePopup(1)}/>

                <input
                    type="text"
                    className={"popup-textbox"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username"
                />
            </div>

            <div>
                <table className={"users-table"}>

                    <tbody>
                    <tr>
                        <th style={{width: '70%'}}>{t("users.username")}</th>
                        <th></th>
                        <th style={{width: '10%'}}></th>
                    </tr>

                    {
                        data.filter((user) =>
                                user.username.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((user) => (
                            <tr key={user.username} className={`users-table-row`}>
                                <td className={"users-table-padding"}>{user.username}</td>
                                <td>{user.isSuperuser ?
                                    <span className={"users-superuser"}>{t("users.superuser")}</span> : null}</td>
                                <td className={"align-right"}>
                                    <DropdownMenu data={user}
                                                  buttonList={user.isSuperuser ? [["userDropdownMenu.demote", UsersDropDownMenuEnum.Demote], ["userDropdownMenu.delete", UsersDropDownMenuEnum.Delete], ["userDropdownMenu.permissions", UsersDropDownMenuEnum.Permissions]] : [["userDropdownMenu.promote", UsersDropDownMenuEnum.Promote], ["userDropdownMenu.delete", UsersDropDownMenuEnum.Delete], ["userDropdownMenu.permissions", UsersDropDownMenuEnum.Permissions]]}
                                                  onItemSelected={onDropDownClicked}/>
                                </td>
                            </tr>
                        ))

                    }
                    </tbody>
                </table>
            </div>

            {activePopup === 1 && <CreateUserPopup currentSessionId={currentSessionId} showMsgBox={showMsgBox}
                                                   closeCallBack={handlePopupClose}/>}
            {activePopup === 2 && <RenameUserPopup currentSessionId={currentSessionId} showMsgBox={showMsgBox}
                                                   currentUsername={activeUsername} closeCallBack={handlePopupClose}/>}

            {activePopup > 2 && <FetchOnlyPopup currentSessionId={currentSessionId}
                                                showMsgBox={showMsgBox}
                                                requestData={requestData}
                                                requestUrl={"/Cassandra/SetUser"}
                                                closeCallBack={handlePopupClose}/>}


            {
                showMessageBox ?
                    <Messagebox messageBoxTitle={messageBoxTitle} messageBoxText={messageBoxText}
                                handleMsgBoxClose={() => setShowMessageBox(false)}/>
                    :
                    null
            }
        </div>
    );
}

export default UsersArea;