import {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import {getCookie} from "../../Global/Other/CookieManager";

import MenuArea from "./MenuArea/MenuArea";

import UsersArea from "./Pages/UsersArea/UsersArea";
import HostsArea from "./Pages/HostsArea/HostsArea";
import StatisticsArea from "./Pages/StatisticsArea/StatisticsArea";
import KeySpacesArea from "./Pages/KeySpacesArea/KeySpacesArea";
import LoadingPopup from "../../LoadingPopup/LoadingPopup";
import AboutArea from "./Pages/AboutArea/AboutArea";

function MainPage() {

    let navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(0);
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    //TODO optimize msgbox system

    useEffect(() => {
        if (sessionId !== '')
            return;

        let currentSessionId = getCookie("sessionId");

        if (currentSessionId === '') {
            navigate("/login");
            return;
        }

        setSessionId(currentSessionId);

        setIsLoading(false);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setCurrentPageValue(index) {
        setCurrentPage(index);
    }

    if (isLoading)
        return <LoadingPopup/>;

    return (
        <>
            <MenuArea setCurrentPageValue={setCurrentPageValue}/>


            {currentPage === 0 && <StatisticsArea currentSessionId={sessionId}/>}
            {currentPage === 1 && <HostsArea currentSessionId={sessionId}/>}
            {currentPage === 2 && <KeySpacesArea currentSessionId={sessionId}/>}
            {currentPage === 3 && <UsersArea currentSessionId={sessionId}/>}
            {currentPage === 4 && <AboutArea currentSessionId={sessionId}/>}
        </>
    );
}

export default MainPage;
