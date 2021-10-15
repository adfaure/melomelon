<!--
  YouTube component.
  User interface to connect and display information about the controlled YouTube tab.
-->
<template>
  <div class="content">
    <p v-if="tabId != 0" class="subtitle is-5">
      <strong>Playing</strong>: {{ title }}
    </p>

  </div>
</template>

<script>
  export default {
    name: 'twitch',
    data() {
      return {
        tabId: 0,
        title: ''
      }
    },
    mounted: function () {
      var self = this;
      chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
        if (result && result["tab"]) {
          chrome.tabs.get(result["tab"], (tab) => {
            self.title = tab.title;
            self.tabId = tab.id;
          })
        }
      });
    },
    methods: {
      gotToControlledTab: function (event) {
        chrome.tabs.update(this.tabId, { selected: true });
      },
      startControlledTab: function (event) {
        self = this;
        chrome.runtime.sendMessage({ type: "open-youtube" }, function (result) {
          if (result && result["error"]) {
            console.log(result["error"]);
            throw result["error"];
          } else if (result && result["state"] && result["state"]["tab"]) {
            var state = result["state"]
            chrome.tabs.get(state["tab"], (tab) => {
              self.title = tab.title;
              self.tabId = tab.id;
            })
          }
        });
      },
      stopControlledTab: function (event) {
        self = this;
        chrome.runtime.sendMessage({ type: "close-youtube" }, function (result) {
          self.title = "";
          self.tabId = 0;
        });
      }
    }
  }
</script>