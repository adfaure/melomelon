/*
  Main script of the extension.

  This script is responsible to manage the state of the extension. Dude to
  limitations of chrome extension, it is stateless and keep it states
  into the local storage. The state is the id of the controlled YouTube
  tab.

  The script doesn't track or get information from any other tabs.
*/

const utils = require('./utils.js');

// Listen to removed tabs, to detect if the user close the
// tab.
chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.local.get(["tab"], (result) => {
    console.log("YouTube tab closed");
    if (result["tab"] && tabId == result["tab"]) {
      chrome.storage.local.set({ tab: null })
    }
  })
})


// Listen to tabs changes.
// 1. We update the song history
// 2. If the user manually changes the url of the controlled tab, the content_script stops
//    causing twitch to disconnect too. In that case we just restart the content script.
//    Beforehand, we start a connection port to ensure, that the script is deconnected,
//    if the content script still lives, we do nothing.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.storage.local.get(["tab"], (result) => {

    if(result.tab == tabId && changeInfo.title) {
      // We prevent from saving tabs opening the youtube index
      var matchTitle = tab.title.match(/(^.*?) - YouTube$/);

      if (matchTitle != null) {
        utils.updateStats(tab, matchTitle[1], "playing");
      }
    }

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


// Listen to incoming port connections.
// When a content script starts, it will connect to this background script
// with the port named 'rendez-vous'. When it is donne, ask the content script to
// connect to twitch irc.
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

// Start the content script in `tabId`.
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
      console.log("Could not start bot: ", e)
    }
  });
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