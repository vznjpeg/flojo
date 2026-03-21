// Background Service Worker

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage().catch(() => {});
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'requestStop') {
    // Notify popup to stop recording
    chrome.runtime.sendMessage({ action: 'stopFromContent' }).catch(() => {});
  }

  if (request.action === 'requestReset') {
    // Notify popup to reset
    chrome.runtime.sendMessage({ action: 'resetFromContent' }).catch(() => {});
  }
});

// Handle screen capture stream closing
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    // Cleanup if needed
  });
});
