require('../css/style.scss');
var Mustache = require('mustache');

var view = {
  title: "Joe",
  calc: function () {
    return 2 + 4;
  }
};

document.addEventListener('DOMContentLoaded', async function (event) {
  var content = document.getElementById("content");

  /* Get the current status of the ext runtime from background process */
  extStatus = await chrome.runtime.sendMessage({ type: "send-status" }, function (extStatus) {

    console.log("Current status", extStatus);

    if(extStatus["connections"]) {
      console.log("Connected!")
      var template = document.getElementById('bot-status-template').innerHTML;
      var rendered = Mustache.render(template, { name: 'Luke' });
      document.getElementById('bot-status-target').innerHTML = rendered;
    }

    var startButton = document.getElementById('startStopControlledTab');

    // onClick's logic below:
    startButton.addEventListener('click', function () {
      chrome.runtime.sendMessage({ type: "open-youtube" });
    })

    var settingsButton = document.getElementById('settingsButton');
    // onClick's logic below:
    settingsButton.addEventListener('click', function () {
      chrome.runtime.sendMessage({ type: "open-settings" });
    })
  })

});