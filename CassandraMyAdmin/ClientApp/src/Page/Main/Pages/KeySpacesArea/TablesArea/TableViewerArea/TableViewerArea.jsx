import './TableViewerArea.css'
import '../../../../../../Global/css/Popup.css'
import '../../../../../../Global/css/Numberbox.css'


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

    const [currentPage, setCurrentPage] = useState(1);
    const [tempPageNumber, setTempPageNumber] = useState(1);

    
    const [isFetching, setIsFetching] = useState(false);
    const [requestData, setRequestData] = useState(null);
    const [columnData, setColumnData] = useState([])

    let timeoutId = null;
    
    useEffect(() => {
        
        const currentRequestData = {
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
        //TODO chat that the page cannot > max page

        setRequestData({
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
        
        if (currentPage <= 0) {
            setCurrentPage(1);
            setTempPageNumber(1);
            return;
        }

        setTempPageNumber(currentPage);
        
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


            <div className={"tableViewer-button-box"}>
                <CustomButton text={t("tableViewer.back")} icon={arrowBackIcon} isActive={false}
                              onClick={() => handleClose()}/>
                
                <div className={"tableViewer-page-switcher-box"}>
                    <button onClick={() => setCurrentPage(currentPage - 1)}>
                        <img className={"tableViewer-anti-image-bug"} src={arrowBackIosIcon} alt={""} />
                    </button>

                    <input
                        type="number"
                        value={tempPageNumber}
                        onChange={(event) => {
                            const number = parseInt(event.target.value);
                            setTempPageNumber(number);
                        }}
                        onBlur={(event => {
                            const number = parseInt(event.target.value);
                            cancelAnimationFrame(timeoutId);
                            timeoutId = requestAnimationFrame(() => {
                                if (!isNaN(number)) {
                                    setCurrentPage(number);
                                }
                            });
                        })}
                        className="number-box"
                    />

                    <button onClick={() => setCurrentPage(currentPage + 1)}>
                        <img src={arrowForwardIosIcon} alt={""} />
                    </button>
                </div>
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
                            <tr className="tableViewer-row" key={index}>
                                {JSON.parse(item).map((innerItem, innerIndex) => (
                                    <td key={innerIndex}>
                                        {typeof innerItem === 'object' && innerItem !== null ? (
                                            <span>
                                            {Object.entries(innerItem).map(([key, value], nestedIndex) => (
                                                <span key={nestedIndex}>
                                                    {nestedIndex > 0 && ", "}
                                                    <strong>{key}:</strong> {value}
                                                </span>
                                            ))}
                                          </span>
                                        ) : (
                                            <span>{innerItem}</span>
                                        )}
                                    </td>
                                ))}
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