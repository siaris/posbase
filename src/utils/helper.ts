export const getCookieValue = (cookieName: string): any => {
    var cookies = document.cookie;
    var cookieArray = cookies.split(";");
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i].trim();
        if (cookie.indexOf(cookieName + "=") === 0) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

export const setCookieWithExpiration = (cookieName: string, cookieValue: any, secondsToExpire: number): any => {
    var date = new Date();
    date.setTime(date.getTime() + (secondsToExpire * 1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
    document.cookie = cookieName + "Ed=" + (Math.floor((date as any)/1000)) + ";" + expires + ";path=/";
}

export const deleteCookie = (cookieName: string): any => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const loginCookieChecked = (): any => {
    if(getCookieValue(window.location.hostname+':token') === null) window.location.href = '/login'
}

export const parseAndCheck = (input: any, parseType?: any): any => {
    parseType = typeof parseType === 'undefined' ? parseFloat : parseType;
    const result = parseType(input);
    return isNaN(result) ? 0 : result;
}
