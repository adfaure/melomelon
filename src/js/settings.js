require('../css/style.scss');

/*
  TODO: Rewrite it in vue
  Setting page, it store user settings into the local storage.
*/

document.addEventListener('DOMContentLoaded', async function (event) {

  /* Connections settings */
  var submit = document.getElementById('submit-connection');
  var clear = document.getElementById('clear-connection');

  var username = document.getElementById('bot-username');
  var token = document.getElementById('bot-token');
  var channel =  document.getElementById('bot-channel');

  /* Command settings */
  var submitCommands = document.getElementById('submit-commands');
  var clearCommands = document.getElementById('clear-commands');
  var commandList = document.getElementById('commands-list');

  await chrome.storage.local.get(['bot-token', 'bot-channel', 'bot-username', 'chat-commands'], function(result) {
    if(result["bot-token"]) {
      token.value = result["bot-token"];
    }
    if(result["bot-username"]) {
      username.value = result["bot-username"];
    }
    if(result["bot-channel"]) {
      channel.value = result["bot-channel"];
    }
    if(result["chat-commands"]) {
      commandList.value = result["chat-commands"];
    }
  });

  // onClick's logic below:
  submit.addEventListener('click', function (a) {
    chrome.storage.local.set({
      "bot-username": username.value,
      "bot-token": token.value,
      "bot-channel": channel.value
    })
  })

  clear.addEventListener('click', function (a) {
    chrome.storage.local.set({
      "bot-username": null,
      "bot-token": null,
      "bot-channel": null
    }, function() {
      username.value = null;
      token.value = null;
      channel.value = null;
    })
  })


  // onClick's logic below:
  submitCommands.addEventListener('click', function () {
    chrome.storage.local.set({
      "chat-commands": commandList.value,
    })
  })

  clearCommands.addEventListener('click', function () {
    chrome.storage.local.set({
      "chat-commands": null,
    }, function() {
      commandList.value = null;
    })
  })

});