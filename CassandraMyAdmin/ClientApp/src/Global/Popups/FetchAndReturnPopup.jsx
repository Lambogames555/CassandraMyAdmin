import '../../Global/css/Popup.css'
import {useEffect} from "react";
import LoadingPopup from "../../LoadingPopup/LoadingPopup";
import Fetcher from "../Other/Fetcher";

function FetchAndReturnPopup({currentSessionId, showMsgBox, requestData, requestUrl, closeCallBack}) {
    const {data, isLoading, fetchData} = Fetcher(null, showMsgBox, true, requestUrl);

    useEffect(() => {

        if (data !== null)
            closeCallBack(data);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        async function fetch() {
            await fetchData(currentSessionId, requestData);
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

export default FetchAndReturnPopup;