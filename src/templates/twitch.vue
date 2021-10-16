<!--
  Twitch component.
  User interface to connect and display information about the twitch bot.
  It communicates with the service background using message.
-->
<template>
  <div class="content">

    <h1 class="title is-5">
      <strong>Twitch status</strong>: {{ status }}
    </h1>

    <div v-if="status !== 'online' && status !== 'connecting'">
      <div v-if="status === 'error'" class="block notification is-danger">
        <p class="block">
          Could not connect: <strong>{{ error_msg }}</strong>.
        </p>
        <p class="block">
          Open the settings page to update the configuration.
        </p>
      </div>
      <div class="control block">
        <button class="button is-primary" v-on:click="startControlledTab">Start bot</button>
      </div>
    </div>
    <div v-else-if="tabId != 0 && status === 'online'">
      <ul>
        <li v-if="tabId != 0">
          <strong>Playing</strong>: {{ title }}
        </li>
        <li v-if="status == 'online' && username && channel "><strong>Connected as:</strong> {{ username }} on channel
          {{ channel }}</li>
      </ul>
      <div class="field is-grouped">
        <p class="control">
          <button class="button is-light is-info" v-on:click="gotToControlledTab">Go to controlled tab</button>
        </p>
        <p class="control">
          <button class="button is-light is-danger" v-on:click="stopControlledTab">Stop bot</button>
        </p>
      </div>
    </div>

  </div>
</template>

<script>

  export default {
    name: 'twitch',
    data() {
      return {
        tabId: 0,
        title: '',
        botname: '',
        username: null,
        channel: '',
        status: 'offline',
        error_msg: ''
      }
    },
    mounted: async function () {
      var self = this;
      this.update();
      this.waitConnection()
    },

    methods: {
      update: async function (event) {
        var self = this;
        chrome.runtime.sendMessage({ type: "send-status" }, function (bgResult) {
          var lastError = chrome.runtime.lastError;
          if (lastError) {
            console.log("Cannot contact BG");
            return;
          }

          console.log("status from bg: ", bgResult);
          if (bgResult["tab"] != null) {
            chrome.tabs.sendMessage(bgResult["tab"], { type: "send-status" }, function (tabResult) {
              var lastError = chrome.runtime.lastError;
              if (lastError) {
                console.log("Cannot contact CS");
                return;
              }

              console.log("status from cs: ", tabResult);
              if (tabResult && tabResult["connected"]) {
                self.status = tabResult["connected"];
                if (tabResult["connected"] == 'error') {
                  self.error_msg = tabResult["error_msg"]
                } else if (tabResult["twitch_client"] &&
                  tabResult["twitch_client"].username &&
                  tabResult["twitch_client"].channels[0]) {

                  self.username = tabResult["twitch_client"].username
                  self.channel = tabResult["twitch_client"].channels[0]
                }
              }
            });

            chrome.tabs.get(bgResult["tab"], (tab) => {
              self.title = tab.title;
              self.tabId = tab.id;
            })
          } else {
            this.tab = 0;
            this.Status = 'offline'
          }
        });
      },
      waitConnection: function () {
        console.log("Wait connection", this);
        setTimeout(() => {
          console.log(this.username)
          if (this.tabId != 0 && (this.status == 'connecting' || this.status == 'offline' || !this.username) && !this.error_msg) {
            console.log("Restart waiting!");
            this.update()
            this.waitConnection()
          }
        }, 100)
      },
      gotToControlledTab: function (event) {
        chrome.tabs.update(this.tabId, { selected: true });
      },
      startControlledTab: function (event) {
        self = this;
        chrome.runtime.sendMessage({ type: "open-youtube" }, function (result) {
          var lastError = chrome.runtime.lastError;
          if (lastError) {
            console.log("Cannot contact BG");
            return;
          }

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
        chrome.runtime.sendMessage({ type: "close-youtube" }, (result) => {
          var lastError = chrome.runtime.lastError;
          if (lastError) {
            console.log("Cannot contact CS");
            return;
          }

          this.title = "";
          this.tabId = 0;
          this.status = "offline";

          setTimeout(() => {
            this.update()
          }, 100)

        });
      }
    }
  }
</script>