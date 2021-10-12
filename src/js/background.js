const twitch = require('./twitch.js');

controlled_tab = null
youtube_handled = false
twitch_client = null
commands_list = ["!song"]
connected = "offline"

// chrome.runtime.onStartup.addListener(initExtension);
// chrome.runtime.onInstalled.addListener(initExtension);
// chrome.runtime.onConnect.addListener(initExtension);

chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
  if (controlled_tab != null && tabId == controlled_tab) {
    console.log("self tab closed")
    controlled_tab = null;
  }
})


chrome.runtime.onMessage.addListener(
  // Principal listener used by the popup to control the extension
  function (request, sender, sendResponse) {

    switch (request.type) {
      // Open a youtube tab controlled by the extension
      case 'open-youtube':
        console.log("Openning youtube tab");

        if (controlled_tab != null) {
          console.log("A tab is already up, removing")
          chrome.tabs.remove(controlled_tab).then(() => {
            console.log("tab closed: ");
            controlled_tab = null;
          })
        }

        chrome.tabs.create({ url: 'https://youtube.com' }).then(
          function (newTab) {
            controlled_tab = newTab.id;
            youtube_handled = true;

            sendResponse({ tab: newTab });

            keepAlive(newTab.id);

          }).catch(function (err) {
            console.log(err);
            sendResponse({ "tab": null, "error": err });
          });

        return true;
        break;
      case 'open-settings':
        chrome.tabs.create({ url: 'settings.html' }).then(
          function (newTab) {
            console.log(newTab);
            sendResponse({});
          }).catch(function (err) {
            console.log(err);
            sendResponse({});
          });
        return true;
        break;
      case 'connect-to-chat':
        if (twitch_client != null && connected === "online") {
          console.log("already connected");
          sendResponse({ "twitch_client": twitch_client })
        } else {
          chrome.storage.local.get(['bot-token', 'bot-channel', 'bot-username'], function (result) {
            if (result["bot-token"] && result["bot-username"] && result["bot-channel"]) {
              console.log("connecting to twitch irc")
              twitch_client = twitch.create_client(result["bot-username"], result["bot-token"], [result["bot-channel"]]);
              // Register client handlers
              twitch_client.on('message', onMessageHandler);
              connected = "connecting"
              twitch_client.connect().then(function (addr, port) {
                sendResponse({ twitch_client: twitch_client });
                connected = "online";
              }).catch(function (error) {
                console.log("Can't connect to twitch", error)
                sendResponse({ twitch_client: null, error: error })
                connected = "error";
              })
            } else {
              connected = "offline";
              sendResponse({ "twitch_client": null, "error": "Missing connection information" });
            }
          });
        }
        return true;
        break;
      case 'send-status':
        console.log("Received send status");
        sendResponse({
          commandList: commands_list,
          tab: controlled_tab,
          connected: connected,
          twitch_client: twitch_client,
          youtube_handled: youtube_handled
        })
        return true;
      case 'keep-alive':
        console.log("hello from content-script")
        sendResponse({})
        break;
    }

  }
);

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  console.log(target, context, msg, self);

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commands_list.includes(commandName)) {
    if (controlled_tab == null) {
      console.log("bot not ready")
    } else {
      chrome.tabs.get(controlled_tab).then(function (tab) {
        twitch_client.say(target, `${tab.title} (${tab.url})`);
      });
    }
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

/* https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension */
let lifeline;


chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
  if (controlled_tab != null && tabId == controlled_tab) {
    console.log("Controlled tab has been closed")
    controlled_tab = null;
    // The tab has been removed
    youtube_handled = false;
  }
})

// The listening port
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    console.log("New port opened", port);
    // save the lifeline
    lifeline = port;

    // Wait information about the current tab
    port.onMessage.addListener(function (message, port) {
      setTimeout(function () {
        if (youtube_handled && controlled_tab == message.tabId) {
          console.log("set timeout function", message)
          keepAliveForced(message.tabId)
        }
      }, 6e4);
      // In case the port is disconnected we restart it
      port.onDisconnect.addListener(function () {
        if (youtube_handled && controlled_tab == message.tabId) {
          console.log("disconnected tab", message);
          keepAliveForced(message.tabId)
        }
      });
    })

  }
});

function keepAliveForced(tabId) {
  console.log("keep alive forced!", tabId);
  lifeline?.disconnect();
  // Reset lifeline so keepAlive is restarted
  lifeline = null;
  keepAlive(tabId);
}

async function keepAlive(tabId) {
  console.log("Calling keep alive", lifeline, tabId)
  if (lifeline) {
    console.log("Already alive, returning")
    return
  };

  console.log("lifeline null, continuing")

  // Retrieve the tab
  chrome.tabs.get(tabId).then(async function (tab) {
    try {
      if (tab.id != controlled_tab) {
        throw "Attatched keepalive on wrong tab current:" + tabId + ", controlled:" + controlled_tab
      }
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (tab) => {
          try {
            var port = chrome.runtime.connect({ name: 'keepAlive' });
            port.postMessage({ tabId: tab.id });
          } catch (e) {
            console.log("could not send message", e)
          }
        },
        args: [tab]
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {
      console.log("chrome.scripting error", e)
    }
  }).catch(function (error) {
    console.log("Tab does not exist anymore", error)
  });

  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  console.log("Tab updated, retry: ", tabId, info, tab, "controlled_tab:", controlled_tab);

  if (youtube_handled && info.url && /^(file|https?):/.test(info.url) && controlled_tab == tabId) {
    console.log("Retried, now calling keep alive!", tabId);
    keepAlive(tabId);
  }

}