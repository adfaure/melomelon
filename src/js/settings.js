import ("../css/settings.css")


document.addEventListener('DOMContentLoaded', async function (event) {

  var submit = document.getElementById('submit');
  var clear = document.getElementById('clear');

  var username = document.getElementById('bot-username');
  var token = document.getElementById('bot-token');
  var channel =  document.getElementById('bot-channel');

  await chrome.storage.local.get(['bot-token', 'bot-channel', 'bot-username'], function(result) {
    if(result["bot-token"]) {
      token.value = result["bot-token"];
    }
    if(result["bot-username"]) {
      username.value = result["bot-username"];
    }
    if(result["bot-channel"]) {
      channel.value = result["bot-channel"];
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
    }).then(function() {
      username.value = null;
      token.value = null;
      channel.value = null;
    })
  })

});