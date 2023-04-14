// ==UserScript==
// @name         Fetch-Cloudwatch-Log
// @namespace    https://www.github.com/yorihaput
// @version      1.0
// @description  Trying to listen get cloudwatch response
// @author       Yori Hadi Putra
// @match        https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var open = window.XMLHttpRequest.prototype.open,
        send = window.XMLHttpRequest.prototype.send;

    var fetchedResult = [];
    function processResponse(url, response) {
        //Just Change logToWatchResponse and urlToWatchResponse;
        const logToWatchResponse = "getCustomer";
        const urlToWatchResponse = "https://logs.ap-southeast-1.amazonaws.com/";
        if (url == urlToWatchResponse && response) {
            try {
                const sResponse = String.fromCharCode.apply(null, new Uint8Array(response));
                const oResponse = JSON.parse(sResponse);

                if (oResponse.events && Array.isArray(oResponse.events)) {
                    const oFetchedResult = []
                    for (const resp of oResponse.events) {
                        if(resp.message.includes(logToWatchResponse)) {
                            const asEventResponse = resp.message.split(logToWatchResponse);
                            //Convert string to object in this case object on the splited string index 1
                            const oEventResponse = (new Function("return " + asEventResponse[1].trim()))();
                            if (typeof oEventResponse == "object" && oEventResponse.masterId) {
                                oFetchedResult.push(oEventResponse);
                            }
                        }
                    }

                    fetchedResult = fetchedResult.concat(Array.from(new Set(oFetchedResult)));
                    generateDownloadLink();
                } else {
                    console.log("Response not valid");
                }

            } catch (error) {
                console.log("Error parse response", error)
            }
        }
    }

    function generateDownloadLink() {
        let currentDownloadLink = document.getElementById("custom-fetch-download-log");
        if(currentDownloadLink) {
            currentDownloadLink.href = 'data:attachment/text,' + encodeURI(JSON.stringify(fetchedResult, null, 4));
        }else{
            const aDownloadLink = document.createElement('a');
            aDownloadLink.href = 'data:attachment/text,' + encodeURI(JSON.stringify(fetchedResult, null, 4));
            aDownloadLink.target = '_blank';
            aDownloadLink.download = 'fetchedCloudWatchLogs.json';
            aDownloadLink.text = "Download Log";
            aDownloadLink.id = "custom-fetch-download-log";
            aDownloadLink.style.bottom = "40px";
            aDownloadLink.style.left = "20px";
            aDownloadLink.style.position = "absolute";
            aDownloadLink.style.zIndex = "9999";
            aDownloadLink.style.background = "#ec7211";
            aDownloadLink.style.color = "#16191f";
            aDownloadLink.style.padding = ".4rem 2rem";
            aDownloadLink.style.fontSize = "1.4rem";
            aDownloadLink.style.lineHeight = "2rem";
            aDownloadLink.style.borderRadius = "2px";
            //aDownloadLink.style = "b:0;right:0;position:absolute;z-index: 9999"
            document.body.append(aDownloadLink);
        }
    }

    function openReplacement(method, url, async, user, password) {
        this._url = url;
        return open.apply(this, arguments);
    }

    function sendReplacement(data) {
        if (this.onreadystatechange) {
            this._onreadystatechange = this.onreadystatechange;
        }
        this.onreadystatechange = onReadyStateChangeReplacement;
        return send.apply(this, arguments);
    }

    function onReadyStateChangeReplacement() {
        processResponse(this._url, this.response);
        if (this._onreadystatechange) {
            return this._onreadystatechange.apply(this, arguments);
        }
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;
    generateDownloadLink();
})();
