document.addEventListener('DOMContentLoaded', function (event) {

  console.log("AddEvents", event);

  var startButton = document.getElementById('startControlledTab');
  // onClick's logic below:
  startButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({type: "open-youtube"});
  })


  var settingsButton = document.getElementById('settingsButton');
  // onClick's logic below:
  settingsButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({type: "open-settings"});
  })

});