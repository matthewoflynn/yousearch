// content script
chrome.extension.sendRequest(window.getSelection().toString());

// This is the return value of the script. 
// It will be passed back to the background script to ensure the injection was successful.
"successfully_injected";