import './AboutArea.css'

import {useEffect, useState} from "react";
import Fetcher from "../../../../Global/Other/Fetcher";
import LoadingPopup from "../../../../LoadingPopup/LoadingPopup";
import Messagebox from "../../../../Global/Elements/Messagebox/Messagebox";
import {useTranslation} from "react-i18next";

function AboutArea({currentSessionId}) {
    const {t} = useTranslation();
    
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxTitle, setMessageBoxTitle] = useState('');
    const [messageBoxText, setMessageBoxText] = useState('');

    const {data, isLoading, error, fetchData} = Fetcher([], showMsgBox, true, '/Cassandra/GetAboutData');

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


    if (isLoading) {
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

    return (
        <div className={"window-box scrollbar"}>


            <h1>{t("about.title")}</h1>
            
            
            <div>
                <div className={"about-header"}>
                    <h1 className={"big-text"}>CassandraMyAdmin V{data["version"]}</h1>
                    <h2>{t("about.licensedUnder")} GNU General Public License v3.0</h2>
                    <h1>{t("about.projectAdministrator")}: <a href={"https://github.com/Lambogames555"} target="_blank" rel="noopener noreferrer">Philipp Stein</a></h1>
                </div>
                
                
                <div className={"about-contributors"}>
                    <div className={"about-contributors-header"}>
                        <h2>{t("about.contributors")}</h2>
                        <p>{t("about.thankYou")} ❤️</p> 
                    </div>
                    <div className={"about-contributors-box"}>
                        {
                            data["contributors"] !== undefined && JSON.parse(data["contributors"]).map(({Login, HtmlUrl, AvatarUrl}) => (
                              <a className={"about-user-item"} key={Login} href={HtmlUrl} target="_blank" rel="noopener noreferrer">
                                  <img className={"about-avatar"} src={AvatarUrl} alt={""} />
                                  {Login}
                              </a>  
                            ))
                        }
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
        </div>
    );
}

export default AboutArea;