import './Captcha.css'

import {useState} from 'react';

import {createWorkerFactory, useWorker} from '@shopify/react-web-worker';

const createCaptchaWorker = createWorkerFactory(() => import('./CaptchaWorker'));


function Captcha() {
    const [solution, setSolution] = useState('notSolved');

    const [isLoading, setLoading] = useState(false);
    const [isVerified, setVerified] = useState(false);

    const captchaWorker = useWorker(createCaptchaWorker);

    const resetCaptcha = () => {
        setVerified(false);
    }
    
    const handleSolveClick = () => {


        setLoading(true);


        fetch('/Cassandra/GetCaptcha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(serverResponse => {
            let splitedServerResponse = serverResponse.split('|');
            let salt = splitedServerResponse[0];
            let difficulty = splitedServerResponse[1];
            
            return captchaWorker.SolveCaptcha(salt, difficulty);
        })
        .then(captchaWorkerResult  => {
            setSolution(captchaWorkerResult);

            setLoading(false);
            setVerified(true);

            setTimeout(resetCaptcha, 55000);
        })
        .catch(error => {
            console.log("Error: " + error);

            setLoading(false);
        });
    }

    return (
        <div className={`captcha-box dark-mode ${isVerified ? "checked" : ""}`}>

            {
                !(isLoading || isVerified) ? (
                    <label className="captcha-container">I'm not a robot
                        <input
                            type="checkbox"
                            id="captcha-checkbox"
                            className="captcha-checkbox"
                            checked={isVerified}
                            onChange={handleSolveClick}
                        />
                        <span className="captcha-checkmark"></span>
                    </label>
                ) : null
            }


            <input id={"solution"} name={"solution"} type={"text"} style={{display: 'none'}} readOnly value={solution}/>


            <div className={`loader ${isLoading ? "loading" : ""}`}></div>
            <svg className={`checkmark ${isVerified ? "verified" : ""}`} viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <g clipPath="url(#id1)">
                    <path className={"checkmark-svg"}
                          fill="rgb(255, 255, 255)"
                          d="M 27.5 7.53125 L 24.464844 4.542969 C 24.15625 4.238281 23.65625 4.238281 23.347656 4.542969 L 11.035156 16.667969 L 6.824219 12.523438 C 6.527344 12.230469 6 12.230469 5.703125 12.523438 L 2.640625 15.539062 C 2.332031 15.84375 2.332031 16.335938 2.640625 16.640625 L 10.445312 24.324219 C 10.59375 24.472656 10.796875 24.554688 11.007812 24.554688 C 11.214844 24.554688 11.417969 24.472656 11.566406 24.324219 L 27.5 8.632812 C 27.648438 8.488281 27.734375 8.289062 27.734375 8.082031 C 27.734375 7.875 27.648438 7.679688 27.5 7.53125 Z M 27.5 7.53125 "
                          fillOpacity="1"
                          fillRule="nonzero"
                    />
                </g>
            </svg>
        </div>
    );
}

export default Captcha;