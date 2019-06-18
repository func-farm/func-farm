'use strict';

// Right click menu
// Copy selected
chrome.contextMenus.create({
    id: "FFcreate",
    title: "Create serverless function",
    contexts: ["selection"],  // ContextType
});

chrome.contextMenus.onClicked.addListener(function (data) {
    // This needs activeTab permission. or does it?
    var selected = '';
    chrome.tabs.executeScript({
        code: "window.getSelection().toString();"
    }, function (selection) {
        selected = selection[0];
    });
    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    chrome.windows.create({
        url: "window.html",
        focused: true,
        width: 500,
        type: "popup"
    }, function (win) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            sleep(500).then(() => {
                // no newline:
                //chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello", code: data.selectionText}, function(response) {
                // Newline, needs permissions
                chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello", code: selected }, function (response) {
                });
            });
        });
    });
});

// Whats this for? an experiment to use chrome credential management
if (window.PasswordCredential || window.FederatedCredential) {
    console.log("EXISTS", window.PasswordCredential);
}

// Clear cached credentials on timer
setInterval(function() {
  console.log("TIMER");
  chrome.storage.local.set({lastUsedCredentials: ""});
},3600000);
