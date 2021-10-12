<template>
  <div id="app">
    <section class="section">
      <h3 class="title">Youtube</h3>
      <div v-if="tab != null">
        Playing: {{ tab }}
      </div>
      <div v-else class="control block">
        <button class="button" v-on:click="startStopControlledTab">Open youtube</button>
      </div>
    </section>
  </div>
</template>

<script>
  export default {
    name: 'twitch',
    data() {
      return {
        tab: null
      }
    },
    mounted: function () {
      var self = this;
      chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
        console.log("status", result);
        if(result && result["tab"]) {
          console.log("controlled tab :", result)
          self.tab = result["tab"]
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