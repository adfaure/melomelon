const twitch = require('./twitch.js');

controlled_tab = null
twitch_client = null
commands_list = ["!song"]


chrome.runtime.onStartup.addListener(initExtension);
chrome.runtime.onInstalled.addListener(initExtension);

async function initExtension() {

  result = chrome.storage.local.get('chat-commands', function (result) {
    commands_list = result["chat-commands"] ? result["chat-commands"].split(",") : commands_list;
    console.log("commands: ", result)
    console.log(commands_list)

    // Called every time a message comes in
    async function onMessageHandler(target, context, msg, self) {
      if (self) { return; } // Ignore messages from the bot

      // Remove whitespace from chat message
      const commandName = msg.trim();

      // If the command is known, let's execute it
      if (commands_list.includes(commandName)) {
        if (controlled_tab == null) {
          console.log("bot not ready")
        } else {
          tab = await chrome.tabs.get(controlled_tab.id)
          client.say(target, `Currently playing: ${tab.title} (${tab.url})`);
        }
      } else {
        console.log(`* Unknown command ${commandName}`);
      }
    }

    chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
      if (controlled_tab != null && tabId == controlled_tab.id) {
        console.log("self tab closed")
        controlled_tab = null;
      }
    })

    chrome.runtime.onMessage.addListener(
      // Principal listener used by the popup to control the extension
      async function (request, sender, sendResponse) {

        switch (request.type) {
          // Open a youtube tab controlled by the extension
          case 'open-youtube':
            console.log("Openning youtube tab");

            if (controlled_tab != null) {
              console.log("A tab is already up, removing")
              await chrome.tabs.remove(controlled_tab.id);
              controlled_tab = null;
            }

            chrome.tabs.create({ url: 'https://youtube.com' }).then(
              function (newTab) {
                controlled_tab = newTab;
                console.log(newTab);
              }).catch(function (err) {
                console.log(err);
              });

            client = await chrome.storage.local.get(['bot-token', 'bot-channel', 'bot-username'], function (result) {
              if (result["bot-token"] && result["bot-username"] && result["bot-channel"]) {
                client = twitch.connect_bot(result["bot-username"], result["bot-token"], [result["bot-channel"]]);
                client.on('message', onMessageHandler);
              } else {
                console.log("Can't connect", result)
                return null;
              }
            });

            break;
          case 'open-settings':
            chrome.tabs.create({ url: 'settings.html' }).then(
              function (newTab) {
                console.log(newTab);
              }).catch(function (err) {
                console.log(err);
              });
            break;

            sendResponse(null)
            return true;
        }
      }
    );
  })
}