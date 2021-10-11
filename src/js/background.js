tmi = require('tmi.js');


controlled_tab = null

chrome.runtime.onInstalled.addListener(() => {
  console.log("Plugin installed")
});

chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
  if(controlled_tab != null && tabId == controlled_tab.id) {
    console.log("self tab closed")
    controlled_tab = null;
  }
})

chrome.runtime.onMessage.addListener(
  // Principal listener used by the popup to control the extension
  async function (request, sender, sendResponse) {

    console.log(request, sender)

    switch (request.type) {
      // Open a youtube tab controlled by the extension
      case 'open-youtube':
        console.log("Openning youtube tab");

        if(controlled_tab != null) {
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


        break;
      // Close the tab if opened tab controlled by the extension
      case 'close-youtube':
          console.log("Closing youtube")

          if(controlled_tab != null) {
            console.log("youtube active, closing");
            await chrome.tabs.remove(controlled_tab.id);
            controlled_tab = null;
          }
        break;

      case 'get-current-url':
          console.log("Getting url")

          if(controlled_tab == null) {
            console.log("Plugin is not active");
          } else {
            console.log(await chrome.tabs.get(controlled_tab.id))
          }

        break;

      default:
        console.log(`Sorry, we are out of ${expr}.`);

      sendResponse(null)
      return true;
    }
  }
);