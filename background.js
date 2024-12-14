// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Set default state of side panel
chrome.sidePanel.setOptions({
  enabled: true,
});
