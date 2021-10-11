
document.addEventListener('DOMContentLoaded', function (event) {

  console.log("AddEvents", event);

  var startButton = document.getElementById('startControlledTab');
  // onClick's logic below:
  startButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({type: "open-youtube"});
  })

  var closeButton = document.getElementById('closeTab');
  // onClick's logic below:
  closeButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({type: "close-youtube"});
  })

  var urlButton = document.getElementById('getUrl');
  // onClick's logic below:
  urlButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({type: "get-current-url"});
  })

});