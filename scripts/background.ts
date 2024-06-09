chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
    chrome.sidePanel.open({
        tabId: tab.id
    });
});