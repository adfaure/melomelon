/*
  Main script of the extension.

  It is a stateful service that maintains a two states:
  - A connection to twitch to respond to chat commands;
  - A chrome tab that will be tracked, to send information to the twitch chat.

  Due to some chrome extension limitations, the end of the script is dedicated to a hack
  that is able to maintain this service alive when the YouTube tab is opened.

  The script doesn't track or get information from any other tabs.
*/

error_msg = null;

// Listen to removed tabs, to detect if the user close the
// tab listen in this script.
chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.local.get(["tab"], (result) => {
    console.log("YouTube tab closed");
    if (result["tab"] && tabId == result["tab"]) {
      chrome.storage.local.set({ tab: null })
    }
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.local.get(["tab"], (result) => {
    // Status complete should be called once
    if (result.tab == tabId && changeInfo.status == "complete") {
      console.log("Receive complete!");

      chrome.tabs.sendMessage(tabId, { type: 'alive' }, async function (state) {
        var lastError = chrome.runtime.lastError;
        if (lastError) {
          console.log("Restarting content script");
          await startBot(tabId);
          return;
        }
        console.log("TAB IS LIVING!");
      })
    }
  })
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'rendez-vous' && port.sender && port.sender.tab) {
    port.onMessage.addListener(function (msg) {
      console.log("Glad you made it");
      port.disconnect();
    })
    chrome.tabs.sendMessage(port.sender.tab.id, { type: 'connect-to-chat' }, function (result) {
      console.log("bot connected ?!", result);
    });
  }
});

async function startBot(tabId) {
  chrome.tabs.get(tabId).then(async function (tab) {
    try {

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["bot.bundle.js"]
        // `function` will become `func` in Chrome 93+
      })

      return;
    } catch (e) {
      console.log("start bot!", e)
    }
    console.log("add listener to retry")
  });
}

function retry(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    console.log("retry!", info);
    startBot(tabId);
  }
}

// Main way to access to this script from other place of the extension.
// The other components of the extension (the popup, states etc)
// can access to the this service using message passing.
chrome.runtime.onMessage.addListener(

  // Principal listener used by the popup to control the extension
  function (request, sender, sendResponse) {

    switch (request.type) {
      // Open a youtube tab controlled by the extension
      case 'open-youtube':
        console.log("Opening YouTube tab");

        chrome.storage.local.get(["tab"], (result) => {
          console.log("YouTube tab closed");
          if (result["tab"]) {
            chrome.storage.local.set({ tab: null })
            console.log("A tab is already up, removing")
            chrome.tabs.remove(result["tab"]);
          }

          chrome.tabs.create({ url: 'https://youtube.com' }).then((tab) => {
            // Start the bot
            // Update the local storage
            chrome.storage.local.set({ "tab": tab.id });
            // Notify the requester
            sendResponse({ tab: tab.id })
          }).catch(function (err) {
            // Could not open tab
            console.log(err);
          });
        })
        return true;
        break;

      case 'close-youtube':
        console.log("Closing youtube tab");
        chrome.storage.local.get(["tab"], (result) => {
          if (result["tab"]) {
            chrome.storage.local.get({ tab: null })
            console.log("A tab is already up, removing")
            chrome.tabs.remove(result["tab"]).then(() => {
              sendResponse({ tab: result["tab"] });
            })
          }
        })
        return true;
        break;

      // Send the current state
      case 'send-status':
        console.log("Received send status");

        chrome.storage.local.get(["tab"], (result) => {
          if (result["tab"]) {
            chrome.tabs.get(result["tab"]).then(function (tab) {
              sendResponse({ tab: result["tab"] })
            }).catch((e) => {
              console.log("could not get tab", e);
              sendResponse({ tab: null })
            })
          }
        })
        return true;
        break;

      case 'get-tab-info':
        console.log("get tab info", sender);
        if (sender.tab) {
          sendResponse({ tab: sender.tab })
        } else {
          console.log("This should be called from a tab")
          sendResponse({ tab: null })
        }
    }
  }
);