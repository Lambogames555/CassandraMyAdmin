import './CreateTableArea.css'
import '../../../../../../Global/css/Popup.css'

import {useState} from 'react';

import {useTranslation} from "react-i18next";
import LoadingPopup from "../../../../../../LoadingPopup/LoadingPopup";
import Fetcher from "../../../../../../Global/Other/Fetcher";
import CustomButton from "../../../../../../Global/Elements/CustomButton/CustomButton";

import closeIcon from '../../../../../../Resources/GoogleMaterialIcons/close.svg'
import addIcon from '../../../../../../Resources/GoogleMaterialIcons/add.svg'


//TODO cleanup code
function CreateTableArea({currentSessionId, currentKeySpace, showMsgBox, handleClose}) {
    const {t} = useTranslation();

    const {isLoading, error, fetchData} = Fetcher('', showMsgBox, false, '/Cassandra/SetTable');

    const [newTableName, setNewCurrentTableName] = useState('');
    const [rows, setRows] = useState([{
        columnNameTextBox: "",
        columnTypeComboBox: "text",
        isPrimaryKeyCheckBox: false
    }]);

    const handleChange = (event, index, key) => {
        // create a new array from the rows state to avoid mutation
        let newRows = [...rows];

        // update the specific cell of the row based on the event and key
        newRows[index][key] = key === "isPrimaryKeyCheckBox" ? event.target.checked : event.target.value;

        // update the state with the new rows
        setRows(newRows);

        // create an empty array to store indices of rows to be removed

        let removeRows = [];

        for (let i = newRows.length - 1; i > 0; i--) {
            // loop through the rows starting from the end (excluding the last row)

            if (newRows[i].columnNameTextBox !== "") {
                // if the current row has a non-empty column name textbox, remove any previous rows to be removed and exit the loop
                removeRows.pop();
                break;
            }

            // add the index of the current row to the rows to be removed array
            removeRows.push(i);
        }

        if (removeRows.length > 0) {
            // create a new array of rows by filtering out the rows with indices to be removed
            newRows = newRows.filter((row, index) => !removeRows.includes(index));
            setRows(newRows); // update the state with the new rows
        }

        // get the last row of the updated rows array
        const lastRow = newRows[newRows.length - 1];

        if (lastRow.columnNameTextBox !== "") {
            // if the last row has a non-empty column name textbox, add a new empty row to the end of the rows array
            setRows([...newRows, {columnNameTextBox: "", columnTypeComboBox: "text", isPrimaryKeyCheckBox: false}]);
        }
    };


    async function handleCreateButtonClick() {
        if (!newTableName) {
            showMsgBox(t("messageBox.warning"), t("createTable.noTableName"))
            return;
        }

        const cassandraRegex = new RegExp('[;&\'"]');

        if (cassandraRegex.test(newTableName)) {
            showMsgBox(t("messageBox.warning"), t("createTable.tableNameContainsForbiddenCharacters"))
            return;
        }


        let column = '';
        let primaryKeys = '';


        rows.forEach((row) => {
            if (row.columnNameTextBox !== "") {
                column += row.columnNameTextBox + " " + row.columnTypeComboBox + ", ";
                if (row.isPrimaryKeyCheckBox) {
                    primaryKeys += row.columnNameTextBox + ", ";
                }
            }
        });

        if (primaryKeys === "") {
            showMsgBox(t("messageBox.warning"), t("createTable.primaryKeyNeeded"))
            return;
        }

        if (cassandraRegex.test(column)) {
            showMsgBox(t("messageBox.warning"), t("createTable.columNameContainsForbiddenCharacters"))
            return;
        }

        column = column.slice(0, -2);
        primaryKeys = primaryKeys.slice(0, -2);

        // noinspection JSIncompatibleTypesComparison
        const requestData = {
            action: 0,
            sessionId: currentSessionId,
            tableName: newTableName,
            keySpaceName: currentKeySpace,
            options: {
                column: column,
                primaryKeys: primaryKeys,
            }
        }

        await fetchData(currentSessionId, requestData);

        handleClose();
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

    //TODO scrollbar for columns

    return (
        <div className={"window-box"}>

            <h1>{t("createTable.title")}</h1>

            {
                // TODO wrong class (users-button-box)
            }
            <div className={"createTable-button-box"}>
                {
                    // TODO dont use the menu button, make this better or rename this button to a "normal" button
                }
                <CustomButton text={t("createTable.cancel")} icon={closeIcon} isActive={false}
                              onClick={() => handleClose()}/>
                <CustomButton text={t("createTable.create")} icon={addIcon} isActive={false}
                              onClick={handleCreateButtonClick}/>
            </div>

            <div className={"popup-input-box"}>
                <label className="popup-label">
                    {t("createTable.newTableName")}
                </label>
                <input
                    type="text"
                    className="popup-textbox"
                    onChange={(event) => setNewCurrentTableName(event.target.value)}
                />
            </div>

            <div className={"createTable-table-box"}>

                <table className={"createTable-table"}>
                    <thead>
                    <tr>
                        <th className={"createTable-colum"}>{t("createTable.name")}</th>
                        <th className={"createTable-colum"}>{t("createTable.type")}</th>
                        <th className={"createTable-colum"}>{t("createTable.primaryKey")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className={"createTable-row"}>
                            <td>
                                <div className={"popup-input-box"}>
                                    <input
                                        type="text"
                                        className="popup-textbox"
                                        value={row.columnNameTextBox}
                                        onChange={(event) => handleChange(event, index, "columnNameTextBox")}
                                    />
                                </div>
                            </td>

                            <td>
                                <div className={"popup-input-box"}>
                                    <select className={"popup-dropdown"}
                                            style={{width: '200px'}}
                                            value={row.columnTypeComboBox}
                                            onChange={(event) => handleChange(event, index, "columnTypeComboBox")}>
                                        <option value="text">Text</option>
                                        <option value="ascii">Ascii</option>
                                        <option value="varchar">Varchar</option>
                                        <option value="blob">Blob</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="int">Int</option>
                                        <option value="bigint">Bigint</option>
                                        <option value="counter">Counter</option>
                                        <option value="float">Float</option>
                                        <option value="double">Double</option>
                                        <option value="decimal">Decimal</option>
                                        <option value="timestamp">Timestamp</option>
                                        <option value="timeuuid">Timeuuid</option>
                                        <option value="uuid">Uuid</option>
                                        <option value="inet">Inet</option>
                                        <option value="list">List</option>
                                        <option value="set">Set</option>
                                        <option value="map">Map</option>
                                    </select>
                                </div>
                            </td>

                            <td>
                                <div className={"popup-input-box"} style={{marginBottom: '30px'}}>
                                    <label className={"popup-checkbox-container"}>
                                        <input
                                            checked={row.isPrimaryKeyCheckBox}
                                            type="checkbox"
                                            onChange={(event) => handleChange(event, index, "isPrimaryKeyCheckBox")}
                                        />
                                        <span className={"popup-checkbox"}></span>
                                    </label>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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

export default CreateTableArea;