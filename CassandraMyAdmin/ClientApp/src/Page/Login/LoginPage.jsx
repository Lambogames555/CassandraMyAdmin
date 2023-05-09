import './LoginPage.css'

import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {setCookie} from "../../Global/Other/CookieManager";
import CustomButton from "../../Global/Elements/CustomButton/CustomButton";
import Messagebox from "../../Global/Elements/Messagebox/Messagebox";
import {useState} from "react";
import LoadingPopup from "../../LoadingPopup/LoadingPopup";

import loginIcon from '../../Resources/GoogleMaterialIcons/login.svg'

function LoginPage() {
    const {t, i18n} = useTranslation();
    let navigate = useNavigate();

    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxTitle, setMessageBoxTitle] = useState('');
    const [messageBoxText, setMessageBoxText] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    
    function handleLanguageChange(event) {
        // noinspection JSIgnoredPromiseFromCall
        i18n.changeLanguage(event.target.value);
    }
    
    async function handleLogin() {
        try {
            // Set the loading state to true.
            setIsLoading(true);

            let usernameInputField = document.getElementById("username");
            let passwordInputField = document.getElementById("password");


            let username = usernameInputField.value;
            let password = passwordInputField.value;

            if (!username || !password)
                return;


            passwordInputField.value = '';


            // Send a POST request to the URL with the request body.
            const response = await fetch('/Cassandra/ConnectToCassandra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            });

            // Get the response data as text and set the HTTP status code.
            const responseText = await response.text();

            // Check for status codes
            switch (response.status) {
                case 400:
                    showMsgBox(t("messageBox.error"), t("messageBox.serverRequestErrors.incorrectlyFormatted"))
                    return;
                case 401:
                    showMsgBox(t("messageBox.error"), t("loginPage.usernameOrPasswordIncorrect"))
                    return;
                case 403:
                    showMsgBox(t("messageBox.error"), t("loginPage.userNotAllowed"))
                    return;
                case 500:
                    showMsgBox(t("messageBox.error"), t("messageBox.serverRequestErrors.serverError"))
                    return;
                case 503:
                    showMsgBox(t("messageBox.error"), t("loginPage.cassandraUnavailable"))
                    return;
                default:
                    break;
            }


            setCookie("sessionId", responseText, 0.2);
            navigate("/")


        } catch (error) {
            showMsgBox(t("messageBox.error"), error.toString())
        } finally {
            // Set the loading state to false, whether the request succeeded or failed.
            setIsLoading(false);
        }
    }

    function showMsgBox(title, text) {
        setShowMessageBox(true);
        setMessageBoxTitle(title)
        setMessageBoxText(text);
    }

    return (
        <>
            <div className={"center max-height"}>
                <div className={"login-box"}>
                    <div className={"login-header"}>
                        <h1 className={"cassandra-my-admin-title"}>Cassandra<span
                            style={{color: "#FF7889"}}>MyAdmin</span></h1>
                    </div>

                    <div className={"center"}>
                        <div className={"login-input-box"}>
                            <label className={"login-label"}>{t("loginPage.username")}</label>
                            <input className={"login-textbox"} type={"text"} id={"username"} autoComplete={"username"}/>
                        </div>

                        <div className={"login-input-box"}>
                            <label className={"login-label"}>{t("loginPage.password")}</label>
                            <input className={"login-textbox"} type={"password"} id={"password"}
                                   autoComplete={"current-password"}/>
                        </div>

                        <div className={"login-input-box"}>
                            <select onChange={handleLanguageChange} className={"popup-dropdown login-dropdown"} value={i18n.language}>
                                <option value="en">🇺🇸 English</option>
                                <option value="de">🇩🇪 German</option>
                            </select>
                        </div>
                    </div>

                    <div className={"login-footer center"}>
                        <CustomButton className={"login-button"}
                                      onClick={handleLogin}
                                      text={t("loginPage.login")}
                                      isActive={false}
                                      icon={loginIcon}/>
                    </div>
                </div>
            </div>

            {
                showMessageBox ?
                    <Messagebox messageBoxTitle={messageBoxTitle} messageBoxText={messageBoxText}
                                handleMsgBoxClose={() => setShowMessageBox(false)}/>
                    :
                    null
            }

            {
                isLoading && <LoadingPopup/>
            }
        </>
    );
}

export default LoginPage;
