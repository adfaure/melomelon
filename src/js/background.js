/*
  Main script of the extension.

  It is a stateful service that maintains a two states:
  - A connection to twitch to respond to chat commands;
  - A chrome tab that will be tracked, to send information to the twitch chat.

  Due to some chrome extension limitations, the end of the script is dedicated to a hack
  that is able to maintain this service alive when the YouTube tab is opened.

  The script doesn't track or get information from any other tabs.
*/
const twitch = require('./twitch.js');

// Global variables, this is the state of the service
controlled_tab = null
youtube_handled = false
twitch_client = null
commands_list = ["!song"]
connected = "offline"

// Bot stats
nb_time_asked = 0
history = []
start_time = new Date().getTime()

// Return the current state
function getState() {
  var current_time = new Date().getTime();

  return {
    commandList: commands_list,
    tab: controlled_tab,
    connected: connected,
    twitch_client: twitch_client,
    youtube_handled: youtube_handled,

    // Stats
    start_time: start_time,
    uptime: current_time - start_time,
    nb_time_asked: nb_time_asked,
    history: history
  };
}

// Listen to removed tabs, to detect if the user close the
// tab listen in this script.
chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
  if (controlled_tab != null && tabId == controlled_tab) {
    console.log("self tab closed")
    controlled_tab = null;
    // Close keep alive lifeline
    lifeline = null;
  }
})

// Listen to tabs event, to log the song history
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("HISTORY", changeInfo, tabId, tab.title)
  if (controlled_tab == tabId && changeInfo.title) {

    // We prevent from saving tabs opening the youtube index
    var matchTitle = tab.title.match(/(^.*?) - YouTube$/);

    if (matchTitle != null) {
      console.log("New song", changeInfo, tabId, tab);
      history.unshift({ title: matchTitle[1], raw_title: tab.title, url: tab.url })
      updateStats(tab, matchTitle[1], "playing");
    }
  }
});

// Main way to access to this script from other place of the extension.
// The other components of the extension (the popup, states etc)
// can access to the this service using message passing.
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

            sendResponse({
              error: null,
              state: getState()
            });

            keepAlive(newTab.id);

          }).catch(function (err) {
            console.log(err);
            sendResponse({ "tab": null, "error": err });
          });

        return true;
        break;

      case 'close-youtube':
        console.log("Closing youtube tab");

        if (controlled_tab != null) {
          console.log("A tab is already up, removing")
          chrome.tabs.remove(controlled_tab).then(() => {
            console.log("tab closed: ");
            controlled_tab = null;
            youtube_handled = false;
            sendResponse({
              error: null,
              state: getState()
            });
          })
        }

        return true;
        break;

      // Connect the twitch bot to twitch chat
      case 'connect-to-chat':
        if (twitch_client != null && connected === "online") {
          console.log("already connected");
          sendResponse({
            error: null,
            state: getState()
          })
        } else {
          chrome.storage.local.get(['bot-token', 'bot-channel', 'bot-username'], function (result) {
            if (result["bot-token"] && result["bot-username"] && result["bot-channel"]) {
              console.log("connecting to twitch irc")
              twitch_client = twitch.create_client(result["bot-username"], result["bot-token"], [result["bot-channel"]]);
              // Register client handlers
              twitch_client.on('message', onMessageHandler);
              connected = "connecting"
              twitch_client.connect().then(function (addr, port) {
                sendResponse({
                  error: null,
                  state: getState()
                });
                connected = "online";
              }).catch(function (error) {
                console.log("Can't connect to twitch", error)
                sendResponse({ state: null, error: error })
                connected = "error";
              })
            } else {
              connected = "offline";
              sendResponse({ state: null, "error": "Missing connection information" });
            }
          });
        }
        return true;
        break;

      // Send the current state
      case 'send-status':
        console.log("Received send status");
        sendResponse(getState())
        return true;
    }
  }
);

// Update polled and history stats in local storage
function updateStats(tab, title, action) {
  chrome.storage.local.get(["stats"], (result) => {
    var stats = {};
    if (result["stats"] == null) {
      stats = {};
    } else {
      stats = result["stats"];
    }

    if (stats[title] == null) {
      stats[title] = {
        url: tab.url,
        raw_title: tab.title,
      };
      stats[title][action] = 1;
    } else if (stats[title][action] == null) {
      stats[title][action] = 1;
    } else {
      stats[title][action]++;
    }

    chrome.storage.local.set({ "stats": stats })
  })
}

// Called every time a chat message comes in
// This is the twitch part, it processes chat messages and respond to
// the commands configured.
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

        // This bot supports only youtube videos
        var match = tab.title.match(/(^.*?) - YouTube$/);
        if (match != null) {
          twitch_client.say(target, `${match[1]} (${tab.url})`);
          // Update the number of time the bot has been called on this session
          nb_time_asked++;
          // Update the local storage stats
          updateStats(tab, match[1], "polled");
        }

      });
    }
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

/*
  https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
  This part is dedicated to maintain this script running when youtube is active.

  Service worker are not meant to be long live services that run forever.
  To overcome this limitation, we periodically open a communication port that will remain
  active for 5 minutes (the lifespan of the service). Each time a new port is active, it
  will keep the service running for 5 more minutes.

  The port is opened from the managed YouTube tab.
*/
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
  chrome.storage.local.get(['keepalive-timeout'], function (result) {

    var timeout = 295e3; // 5 minutes minus 5 seconds (default value)
    if (result["keepalive-timeout"]) {
      timeout = result["keepalive-timeout"] * 1e3
    }

    if (port.name === 'keepAlive') {
      console.log("New port opened", port);
      // save the lifeline
      lifeline = port;

      setTimeout(function () {
        if (youtube_handled && controlled_tab == controlled_tab) {
          console.log("set timeout function", controlled_tab)
          keepAliveForced(controlled_tab)
        }
      }, timeout);
      // In case the port is disconnected we restart it
      port.onDisconnect.addListener(function () {
        if (youtube_handled && controlled_tab == controlled_tab) {
          console.log("disconnected tab", controlled_tab);
          keepAliveForced(controlled_tab)
        }
      });
    }
  });
});

function keepAliveForced(tabId) {
  console.log("keep alive forced!", tabId);
  lifeline?.disconnect();
  // Reset lifeline so keepAlive is restarted
  lifeline = null;
  keepAlive(tabId);
}

async function keepAlive(tabId) {
  if (lifeline) {
    return
  };

  // Retrieve the tab
  chrome.tabs.get(tabId).then(async function (tab) {
    try {
      if (tab.id != controlled_tab) {
        throw "Attached keepalive on wrong tab current:" + tabId + ", controlled:" + controlled_tab
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
      // This should append as when a new tab is opened or updated, the url might not
      // be available. In that case, the script fail with permission error.
      // We re-add the listener and wait for the url to be updated.
      console.log("chrome.scripting error", e)
    } chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
  });

  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (youtube_handled && info.url && /^(file|https?):/.test(info.url) && controlled_tab == tabId) {
    console.log("Retried, now calling keep alive!", tabId);
    keepAlive(tabId);
  }

}