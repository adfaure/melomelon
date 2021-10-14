<!--
  YouTube component.
  User interface to connect and display information about the controlled YouTube tab.
-->
<template>
  <div class="content">
    <p class="title is-3">Youtube</p>
    <p v-if="tabId != 0" class="subtitle is-5">
      <strong>Playing</strong>: {{ title }}
    </p>

    <div v-if="tabId != 0" class="field is-grouped">
      <p class="control">
        <button class="button is-light is-info" v-on:click="gotToControlledTab">Go to controlled tab</button>
      </p>
      <p class="control">
        <button class="button is-light is-danger" v-on:click="stopControlledTab">Stop youtube</button>
      </p>
    </div>

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