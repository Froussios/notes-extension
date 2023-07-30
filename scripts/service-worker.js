chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);

  chrome.runtime.sendMessage({
    name: "show-notes",
    data: { value: url },
  });

  // Enables the side panel on google.com
  //   if (url.origin === GOOGLE_ORIGIN) {
  //     await chrome.sidePanel.setOptions({
  //       tabId,
  //       path: "sidepanel.html",
  //       enabled: true,
  //     });
  //   } else {
  //     // Disables the side panel on all other sites
  //     await chrome.sidePanel.setOptions({
  //       tabId,
  //       enabled: false,
  //     });
  //   }
});
