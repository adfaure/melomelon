<!--
  Twitch component.
  User interface to connect and display information about the twitch bot.
  It communicates with the service background using message.
-->
<template>
  <div class="content">

    <h1 v-if="tabState == 'loading'" class="title is-5">
      <strong>Loading YouTube</strong>
    </h1>
    <h1 v-else class="title is-5">
      <strong>Twitch status</strong>: {{ status }}
    </h1>

    <div v-if="connectionInfoMissing" class="block notification is-info">
      <p class="block">
        No twitch login information.
        Open the settings page to add your connection information.
      </p>
      <p class="control">
        <button class="button is-light is-link is-small" v-on:click="openSettingsTab">Open settings</button>
      </p>
    </div>
    <div v-else-if="status !== 'online' && status !== 'connecting'">
      <div v-if="status === 'error'" class="block notification is-danger">
        <p class="block">
          Could not connect: <strong>{{ error_msg }}</strong>.
        </p>
        <p class="block">
          Open the settings page to update the configuration.
        </p>
      </div>
      <div v-else-if="tabId == 0" class="control block">
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
        tabState: null,
        title: '',
        username: null,
        channel: '',
        status: 'offline',
        error_msg: '',
        connectionInfoMissing: false,
      }
    },
    mounted: async function () {
      this.update();
      this.waitConnection()
    },

    methods: {
      openSettingsTab: function (event) {
        chrome.tabs.create({ url: 'settings.html' }).then(
          function (newTab) {
            console.log(newTab);
          }).catch(function (err) {
            console.log(err);
          });
      },
      update: async function (event) {
        chrome.runtime.sendMessage({ type: "send-status" }, (bgResult) => {
          var lastError = chrome.runtime.lastError;
          if (lastError) {
            console.log("Cannot contact BG");
            return;
          }

          console.log("status from bg: ", bgResult);
          if(bgResult["error"]) {
            this.connectionInfoMissing = true;
          } else if (bgResult["tab"] != null) {
            chrome.tabs.sendMessage(bgResult["tab"], { type: "send-status" }, (tabResult) => {
              var lastError = chrome.runtime.lastError;
              if (lastError) {
                console.log("Cannot contact CS");
                return;
              }

              console.log("status from cs: ", tabResult);
              if (tabResult && tabResult["connected"]) {
                this.status = tabResult["connected"];
                if (tabResult["connected"] == 'error') {
                  this.error_msg = tabResult["error_msg"]
                } else if (tabResult["twitch_client"] &&
                  tabResult["twitch_client"].username &&
                  tabResult["twitch_client"].channels[0]) {
                  this.username = tabResult["twitch_client"].username
                  this.channel = tabResult["twitch_client"].channels[0]
                }
              }
            });

            chrome.tabs.get(bgResult["tab"], (tab) => {
              this.tabState = tab.status;
              this.title = tab.title;
              this.tabId = tab.id;
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
        }, 1000)
      },
      gotToControlledTab: function (event) {
        chrome.tabs.update(this.tabId, { selected: true });
      },
      startControlledTab: function (event) {
        chrome.runtime.sendMessage({ type: "open-youtube" }, (result) => {
          var lastError = chrome.runtime.lastError;
          if (lastError) {
            console.log("Cannot contact BG");
            return;
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