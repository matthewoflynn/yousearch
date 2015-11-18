// content script

console.log("loaded content script");

chrome.extension.sendRequest(window.getSelection().toString());