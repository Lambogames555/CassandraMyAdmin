import './TableViewerArea.css'
import '../../../../../../Global/css/Popup.css'

import {useEffect, useState} from 'react';

import {useTranslation} from "react-i18next";
import LoadingPopup from "../../../../../../LoadingPopup/LoadingPopup";
import Fetcher from "../../../../../../Global/Other/Fetcher";
import FetchAndReturnPopup from "../../../../../../Global/Popups/FetchAndReturnPopup";
import CustomButton from "../../../../../../Global/Elements/CustomButton/CustomButton";

import arrowBackIcon from '../../../../../../Resources/GoogleMaterialIcons/arrowback.svg'
import arrowBackIosIcon from '../../../../../../Resources/GoogleMaterialIcons/arrowbackios.svg'
import arrowForwardIosIcon from '../../../../../../Resources/GoogleMaterialIcons/arrowforwardios.svg'

function TableViewerArea({currentSessionId, currentKeySpace, currentTable, showMsgBox, handleClose}) {
    const {t} = useTranslation();

    const {data, isLoading, error, fetchData} = Fetcher([], showMsgBox, true, '/Cassandra/GetTableData');

    const [currentPage, setCurrentPage] = useState(0);

    const [isFetching, setIsFetching] = useState(false);
    const [requestData, setRequestData] = useState(null);
    const [columnData, setColumnData] = useState([])

    useEffect(() => {

        // TODO remove sessionId from requestData -> it is no longer needed
        const currentRequestData = {
            sessionId: currentSessionId,
            action: 0,
            keySpaceName: currentKeySpace,
            tableName: currentTable,
            options: {}
        };

        // noinspection JSIgnoredPromiseFromCall
        fetchData(currentSessionId, currentRequestData);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function fetchRowData() {

        if (currentPage < 0)
            setCurrentPage(0);

        //TODO chat that the page cannot > max page

        setRequestData({
            sessionId: currentSessionId,
            action: 1,
            keySpaceName: currentKeySpace,
            tableName: currentTable,
            options: {
                page: currentPage.toString(), // TODO dynamic page sizes
            },
        })
        
        setIsFetching(true);
    }

    useEffect(() => {
        fetchRowData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);


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


    if (isFetching) {
        return (
            <>
                <FetchAndReturnPopup currentSessionId={currentSessionId}
                                     requestData={requestData}
                                     requestUrl={"/Cassandra/GetTableData"}
                                     showMsgBox={showMsgBox}
                                     closeCallBack={(data) => {
                                         setColumnData(data);
                                         setIsFetching(false)
                                     }}/>

                {
                    isLoading ?
                        <LoadingPopup/>
                        :
                        null
                }
            </>
        );
    }

    return (
        <div className={"window-box"}>

            <h1>{t("tableViewer.title", {tableName: currentTable})}</h1>


            <div className={"createTable-button-box"}>
                {
                    // TODO better "page switch" button system
                }
                <CustomButton text={t("tableViewer.back")} icon={arrowBackIcon} isActive={false}
                              onClick={() => handleClose()}/>
                <CustomButton text={t("tableViewer.last")} icon={arrowBackIosIcon} isActive={false}
                              onClick={() => setCurrentPage(currentPage - 1)}/>
                <CustomButton text={t("tableViewer.next")} icon={arrowForwardIosIcon} isActive={false}
                              onClick={() => setCurrentPage(currentPage + 1)}/>
            </div>

            <div className={"tableViewer-box"}>
                <table className={"tableViewer-table"}>
                    <thead>
                    <tr>
                        {
                            data.map((item) => (
                                <th className={"tableViewer-column"} key={item}>{item}</th>
                            ))
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        columnData.map((item, index) => (
                            <tr className={"tableViewer-row"} key={index}>
                                {
                                    JSON.parse(item).map((innerItem) => (
                                        <td key={innerItem}>{innerItem}</td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>


            { //TODO is this needed?
                isLoading ?
                    <LoadingPopup/>
                    :
                    null
            }


        </div>
    );
}

export default TableViewerArea;