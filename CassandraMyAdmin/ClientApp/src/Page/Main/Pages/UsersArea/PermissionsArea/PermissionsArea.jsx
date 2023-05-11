import './PermissionsArea.css'
import '../../../../../Global/css/ReactSelect.css'

import {useTranslation} from "react-i18next";
import CustomButton from "../../../../../Global/Elements/CustomButton/CustomButton";

import closeIcon from "../../../../../Resources/GoogleMaterialIcons/close.svg";
import saveIcon from "../../../../../Resources/GoogleMaterialIcons/save.svg";

import {useEffect, useState} from "react";

import Select from 'react-select';
import Fetcher from "../../../../../Global/Other/Fetcher";
import LoadingPopup from "../../../../../LoadingPopup/LoadingPopup";

function PermissionsArea({currentSessionId, currentUsername, handleClose, showMsgBox}) {
    const {t} = useTranslation();


    const {data, isLoading, error, fetchData} = Fetcher({}, showMsgBox, true, '/Cassandra/Permissions');

    const [keyspacesOptions, setKeyspacesOptions] = useState([]);
    const [tablesOptions, setTablesOptions] = useState([]);
    const [rolesOptions, setRolesOptions] = useState([]);

    
    const [rows, setRows] = useState([{
        privilege: "",
        resourceName: "none",
        resourceNameValue: "none",
        resourceNameValueEnabled: false,
        resourceNameValueOptionsList: [],
    }]);

    const options = [
        { value: 'ALTER', label: 'ALTER' },
        { value: 'AUTHORIZE', label: 'AUTHORIZE' },
        { value: 'CREATE', label: 'CREATE' },
        { value: 'DROP', label: 'DROP' },
        { value: 'MODIFY', label: 'MODIFY' },
        { value: 'SELECT', label: 'SELECT' },
    ];

    useEffect(() => {

        const requestData = {
            action: 0,
            username: currentUsername,
            options: {},
        }
        
        fetchData(currentSessionId, requestData)
        
    }, [currentSessionId]);

    useEffect(() => {
        

        if (data["success"] !== undefined) {
            handleClose();
            return;
        }
            
      
        if (data["userPermissions"] !== undefined) {
            
            let userPermissions = data["userPermissions"];
            
            setKeyspacesOptions(data["keyspaces"]);
            setTablesOptions(data["tables"]);
            setRolesOptions(data["roles"]);
            
            let newRows = [];
            
            if (userPermissions.count !== 0)
                Object.entries(userPermissions).map(([resource, permissions]) => {
                    
                    let resourceName = undefined;
                    let resourceNameValue = undefined;
                    
                    if (resource.startsWith("data")) {
    
                        if (resource.includes("/")) {
                            let tempValue = resource.replace("data/", "");
    
                            resourceNameValue = tempValue.replace("/", ".");
    
                            if (tempValue.includes("/"))
                                resourceName = "TABLE";
                            else
                                resourceName = "KEYSPACE";
                        }
                        else
                        {
                            resourceNameValue = "";
                            resourceName = "ALL KEYSPACES";  
                        }
                    }
    
                    if (resource.startsWith("role")) {
    
                        if (resource.includes("/")) {
                            resourceNameValue = resource.replace("role/", "");
                            
                            resourceName = "ROLE";
                        }
                        else
                        {
                            resourceNameValue = "";
                            resourceName = "ALL ROLES";
                        }
                    }
    
                    const privilegeData = permissions.map(value => ({ value: value, label: value }));
    
    
                    newRows = [...newRows, {privilege: privilegeData, resourceName: resourceName, resourceNameValue: resourceNameValue, resourceNameValueEnabled: resourceNameValue !== "", resourceNameValueOptionsList: []}];
                });

            setRows([...newRows, {privilege: "", resourceName: "none", resourceNameValue: "none", resourceNameValueEnabled: false, resourceNameValueOptionsList: []}]);
        }
        
    }, [data]);

    const handleChange = (event, index, key) => {
        // create a new array from the rows state to avoid mutation
        let newRows = [...rows];

        // create an empty array to store indices of rows to be removed
        let removeRows = [];

        // check if selected value is "deleteMe"
        if (key === "resourceName" && event.target.value === "deleteMe") {
            if (!window.confirm(t("confirmBoxText")))
                return;

            removeRows.push(index);
        }
        else {
            // update the specific cell of the row based on the event and key
            newRows[index][key] = key === "privilege" ? event : event.target.value;
                
            if (key === "resourceName") {
                // Clear the "resourceNameValue" field
                newRows[index]["resourceNameValue"] = "none";

                // Enable the "resourceNameValueTextbox"
                newRows[index]["resourceNameValueEnabled"] = true;
                
                // Based on the selected value in the "resourceName" field, set the preview and enable/disable the "resourceNameValueTextbox"
                switch (newRows[index][key]) {
                    case "none":
                    case "ALL KEYSPACES":
                    case "ALL ROLES":
                        // Disable the "resourceNameValueTextbox"
                        newRows[index]["resourceNameValueEnabled"] = false;
                        break;
                    default:
                    case "KEYSPACE":
                        // Set the preview to the "keyspaceName" translation
                        newRows[index]["resourceNameValueOptionsList"] = keyspacesOptions;
                        break;
                    case "TABLE":
                        // Set the preview to the "tableName" translation
                        newRows[index]["resourceNameValueOptionsList"] = tablesOptions;
                        break;
                    case "ROLE":
                        // Set the preview to the "roleName" translation
                        newRows[index]["resourceNameValueOptionsList"] = rolesOptions;
                        break;
                }
            }
        }

        // update the state with the new rows
        setRows(newRows);

        for (let i = newRows.length - 1; i > 0; i--) {
            // loop through the rows starting from the end (excluding the last row)

            if (newRows[i].resourceName !== "none") {
                // if the current row has a non-empty column name resourceName, remove any previous rows to be removed and exit the loop
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

        if (lastRow === undefined || lastRow.resourceName !== "none") {
            // if the last row has a non-empty column name resourceName, add a new empty row to the end of the rows array
            setRows([...newRows, {privilege: "", resourceName: "none", resourceNameValue: "none", resourceNameValueEnabled: false, resourceNameValueOptionsList: []}]);
        }
    };


    function savePermissions() {
        const cassandraRegex = new RegExp('[;&\'"]');

        let permissionsArray = [];

        rows.forEach((row) => {
            if (row.resourceName !== "none" && row.privilege.length !== 0 && !(row.resourceNameValueEnabled && row.resourceNameValue === "none")) {
                if (cassandraRegex.test(row.resourceNameValue)) {
                    showMsgBox(t("messageBox.warning"), t("permissions.textContainsForbiddenCharacters"))
                    return;
                }
                
                const privilegeValues = row.privilege.map(item => item.value);

                permissionsArray = [...permissionsArray, { resourceName: row.resourceName, resourceNameValue: row.resourceNameValue, privilege: privilegeValues }];
            }
        });
        
        
        const requestData = {
            action: 1,
            username: currentUsername,
            options: {
                permissions: permissionsArray
            },
        }

        fetchData(currentSessionId, requestData)

    
    }
    
    if (isLoading)
        return (
          <LoadingPopup />  
        );

    if (error) {
        // TODO better error screen
        return (
            <div className={"empty-window-box"}>
                <h1>Error...</h1>
            </div>
        )
    }
    
    return (
        <div className={"window-box scrollbar"}>
            <h1>{t("permissions.title", {username: currentUsername})}</h1>

            <div className={"permissions-button-box"}>
                <CustomButton text={t("permissions.cancel")} icon={closeIcon} isActive={false}
                              onClick={() => handleClose()}/>
                <CustomButton text={t("permissions.save")} icon={saveIcon} isActive={false}
                              onClick={() => savePermissions()}/>
            </div>
            
            <ul className={"permissions-list"}>
                {rows.map((row, index) => (
                    <li key={index} className={"permissions-list-item"}>
                        <div className={"center flexbox-row permissions-top-box"}>
                            <select className={"popup-dropdown"}
                                    value={row.resourceName}
                                    onChange={(event) => handleChange(event, index, "resourceName")}>>
                                <option value={"none"}>{t("permissions.pleaseSelect")}</option>
                                <option disabled="disabled">&#x2500;&#x2500;&#x2500;&#x2500;</option>
                                <option>ALL KEYSPACES</option>
                                <option>KEYSPACE</option>
                                <option>TABLE</option>
                                <option>ALL ROLES</option>
                                <option>ROLE</option>
                                <option disabled="disabled">&#x2500;&#x2500;&#x2500;&#x2500;</option>
                                <option value={"deleteMe"}>{t("permissions.deleteThisPermission")}</option>
                            </select>
                            
                            <select className={"popup-dropdown"}
                                    disabled={!row.resourceNameValueEnabled}
                                    value={row.resourceNameValue}
                                    onChange={(event) => handleChange(event, index, "resourceNameValue")}>>
                                <option value={"none"}>{t("permissions.pleaseSelect")}</option>
                                <option disabled="disabled">&#x2500;&#x2500;&#x2500;&#x2500;</option>
                                {   
                                    row.resourceNameValueOptionsList.map(value => (
                                        <option>{value}</option>  
                                    ))
                                }
                            </select>
                        </div>

                        <div className={"multi-select-container"}>
                            <Select
                                className="select-container"
                                classNamePrefix="select"
                                isMulti
                                options={options}
                                value={row.privilege}
                                onChange={(event) => handleChange(event, index, "privilege")}/>
                        </div>
                        
                        <hr/>
                    </li>
                ))}
            </ul>
        </div>
        
    );
}

export default PermissionsArea;