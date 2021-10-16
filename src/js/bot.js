// Content script.
// This script is started by the background script on the tab controlled by the extension.
// It caonnects to twitch irc, and responds to commands in `commands_list`.
// If the bot is playing a youtube video, the title and the url of the video is send to
// the chat.

const twitch = require('./twitch.js');
const utils = require('./utils.js');

// Global variables, this is the state of the service
youtube_handled = false
twitch_client = null
commands_list = ["!song"]
connected = "connecting"
error_msg = null
myId = null

// Bot stats
history = []
start_time = new Date().getTime()

// Main way to access to this script from other place of the extension.
// The other components of the extension (the popup, states etc)
// can access to the this service using message passing.
chrome.runtime.onMessage.addListener(

  // Principal listener used by the popup to control the extension
  function (request, sender, sendResponse) {
    switch (request.type) {

      case 'alive':
        console.log("I am here bro");
        sendResponse({})
        break

      // Connect the twitch bot to twitch chat
      case 'connect-to-chat':
        console.log("Receive connect-to-chat", request, sender)
        if (twitch_client != null && connected === "online") {
          console.log("already connected");
          sendResponse(getState())
        } else {
          chrome.storage.local.get(['bot-token', 'bot-channel', 'bot-username'], function (result) {
            if (result["bot-token"] && result["bot-username"] && result["bot-channel"]) {
              console.log("connecting to twitch irc")
              twitch_client = twitch.create_client(result["bot-username"], result["bot-token"], [result["bot-channel"]]);
              // Register client handlers
              twitch_client.on('message', onMessageHandler);
              connected = "connecting"
              twitch_client.connect().then(function (addr, port) {
                connected = "online";
                sendResponse(getState());
              }).catch(function (error) {
                console.log("Can't connect to twitch", error)
                connected = "error";
                error_msg = error;
                sendResponse(getState())
              })
            } else {
              connected = "error";
              error_msg = "Missing connection information";
              sendResponse(getState());
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

// Onwe we registred eventlisteners, we notify the background script
// that we are alive.
var port = chrome.runtime.connect({ name: "rendez-vous" });
port.postMessage({});

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
    chrome.runtime.sendMessage({ type: 'get-tab-info' }, function (result) {
      if (result.tab) {
        // This bot supports only youtube videos
        var match = result.tab.title.match(/(^.*?) - YouTube$/);
        if (match != null) {
          twitch_client.say(target, `${match[1]} (${result.tab.url})`);
          // Update the local storage stats
          utils.updateStats(result.tab, match[1], "polled");
        } else {
          twitch_client.say(target, `No song is playing right now.`);
        }
      }
    });
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Return the current state
function getState() {
  var current_time = new Date().getTime();

  return {
    commandList: commands_list,

    connected: connected,
    error_msg: error_msg,
    twitch_client: twitch_client,
    youtube_handled: youtube_handled,

    // Stats
    start_time: start_time,
    uptime: current_time - start_time,
    history: history
  };
}