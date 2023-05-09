// This function sets a cookie with a given name, value, and number of days until expiration
export function setCookie(name, value, days) {
    // Create a new Date object and add the number of days to it to get the expiration date
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    // Convert the expiration date to a UTC string and concatenate it with the name and value to create the cookie string
    const expires = "expires=" + date.toUTCString();
    // Set the cookie using the cookie string and specify the path as the root directory
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// This function gets the value of a cookie with a given name
export function getCookie(name) {
    // Create a string that includes the cookie name and an equals sign to search for in the decoded cookie string
    const cookieName = name + "=";
    // Decode the cookie string so that special characters are readable
    const decodedCookie = decodeURIComponent(document.cookie);
    // Split the decoded cookie string into an array of individual cookies
    const cookieArray = decodedCookie.split(";");
    // Loop through each cookie in the array and trim any whitespace before checking if it matches the desired cookie name
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            // If the cookie name matches, return the value of the cookie
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    // If the cookie name is not found, return an empty string
    return "";
}

export function removeCookie(name) {
    document.cookie = name + "=;Max-Age=0;path=/";
}