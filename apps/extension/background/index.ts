import { Storage } from '@plasmohq/storage';

const storage = new Storage();

// Listen for messages from the web app (injected via content script or direct postMessage)
chrome.runtime.onMessageExternal?.addListener(async (message, _sender, sendResponse) => {
  if (message.type === 'APPLYX_TOKEN' && message.token) {
    await storage.set('supabaseToken', message.token);
    // Forward to sidebar content script
    chrome.tabs.query({ url: 'https://www.linkedin.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'APPLYX_TOKEN', token: message.token });
      });
    });
    sendResponse({ ok: true });
  }
});
