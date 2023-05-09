// This custom hook fetches data from a specified URL and returns the response data, HTTP status code, loading state, and error state.
import {useCallback, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

const useFetcher = (initialData, showMsgBox, isJsonResponse, url) => {
    // Define state variables for the data, loading state, and error state.
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const {t} = useTranslation();
    let navigate = useNavigate();

    // Define a memoized fetchData function that fetches data from the URL and updates the state variables accordingly.
    const fetchData = useCallback(async (sessionId, requestData) => {
        try {
            // If the session ID is empty, do not fetch data.
            if (sessionId === '')
                return;

            // Set the loading state to true.
            setIsLoading(true);

            // Define the request body to be sent with the fetch request.
            const body = {sessionId: sessionId, ...requestData};

            // Send a POST request to the URL with the request body.
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            // Get the response data as text and set the HTTP status code.
            const responseText = await response.text();

            // Check for status codes
            switch (response.status) {
                case 400:
                    if (showMsgBox !== null)
                        showMsgBox(t("messageBox.error"), t("messageBox.serverRequestErrors.incorrectlyFormatted"))
                    return;
                case 401:
                    navigate("/login");
                    return;
                case 500:
                    if (showMsgBox !== null)
                        showMsgBox(t("messageBox.error"), t("messageBox.serverRequestErrors.serverError"))
                    return;
                default:
                    break;
            }

            // Update the data state variable with the response data, either parsed JSON or text depending on the isJsonResponse flag.
            if (isJsonResponse)
                setData(JSON.parse(responseText));
            else
                setData(responseText);

            // Clear the error state.
            setError(null);
        } catch (error) {
            // Set the error state to the caught error.
            setError(error);

            if (showMsgBox !== null)
                showMsgBox(t("messageBox.error"), error.toString())
        } finally {
            // Set the loading state to false, whether the request succeeded or failed.
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isJsonResponse, url]);

    // Return an object with the data, loading state, error state, and the memoized fetchData function.
    return {data, isLoading, error, fetchData};
};

// Export the useFetcher hook as the default export.
export default useFetcher;