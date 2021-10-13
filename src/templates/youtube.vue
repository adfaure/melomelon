<template>
  <div class="content">
    <p class="title is-3">Youtube</p>
    <p v-if="tabId != 0" class="subtitle is-5">
      <strong>Playing</strong>: {{ title }}
    </p>
    <p v-if="tabId != 0">
      <button class="button is-light is-danger" v-on:click="stopControlledTab">Stop youtube</button>
    </p>
    <div v-else class="control block">
      <button class="button" v-on:click="startControlledTab">Open youtube</button>
    </div>
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
        console.log("status", result);
        if (result && result["tab"]) {
          chrome.tabs.get(result["tab"], (tab) => {
            self.title = tab.title;
            self.tabId = tab.id;
          })
        }
      });

      chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
        self.tab = null;
      })

    },
    methods: {
      startControlledTab: function (event) {
        self = this;
        chrome.runtime.sendMessage({ type: "open-youtube" }, function (result) {
          if (result && result["error"]) {
            console.log(result["error"]);
            throw result["error"];
          } else if (result && result["state"] && result["state"]["tab"]) {
            state = result["state"]
            chrome.tabs.get(sate["tab"], (tab) => {
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