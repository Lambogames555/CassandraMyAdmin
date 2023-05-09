import '../../Global/css/Popup.css'
import {useEffect} from "react";
import LoadingPopup from "../../LoadingPopup/LoadingPopup";
import Fetcher from "../Other/Fetcher";

function FetchOnlyPopup({currentSessionId, showMsgBox, requestData, requestUrl, closeCallBack}) {
    const {isLoading, fetchData} = Fetcher('', showMsgBox, false, requestUrl);

    useEffect(() => {
        async function fetch() {
            fetchData(currentSessionId, requestData).then(() => {
                closeCallBack();
            });
        }

        // noinspection JSIgnoredPromiseFromCall
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    if (isLoading) {
        return <LoadingPopup/>
    }

    return <></>
}

export default FetchOnlyPopup;