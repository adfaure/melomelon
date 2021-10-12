<template>
  <div class="content">
    <p class="title is-4">Youtube</p>
    <p class="subtitle" v-if="tabId != 0">
      <strong>Playing</strong>: {{ title }}
    </p>
    <div v-else class="control block">
      <button class="button" v-on:click="startStopControlledTab">Open youtube</button>
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
        if(result && result["tab"]) {
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
      startStopControlledTab: function (event) {
        self = this;
        chrome.runtime.sendMessage({ type: "open-youtube" }, function(result) {
          console.log("getting tab.id", result)
        });
      }
    }
  }
</script>