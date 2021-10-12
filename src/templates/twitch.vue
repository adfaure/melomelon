<template>
  <div id="app">
    <section class="section">
        <h3 class="title">Twich status</h3>
        <div class="">
          Twitch bot status: {{ status }}
        </div>
        <div v-if="status !== 'online' && status !== 'connecting'">

          <div v-if="status === 'error'" class="block notification is-danger">
            <div class="block">
              Could not connect: <strong>{{ error_msg }}</strong>.
            </div>
            <div class="block">
              Open the settings page to update the configuration.
            </div>
          </div>

          <div class="control block">
            <button class="button" v-on:click="startBot">Start bot</button>
          </div>

        </div>
        <div v-else-if="status === 'online'" class="field is-grouped">
          <p>
            Connected as {{ username }} on channel {{ channel }}
          </p>
        </div>
    </section>
  </div>
</template>

<script>
  export default {
    name: 'twitch',
    data() {
      return {
        botname: '',
        username: '',
        channel: '',
        status: "offline",
      }
    },
    mounted: function () {
      var self = this;
      chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
        if (result && result["twitch_client"] && result["connected"]) {
          self.status = result["connected"];
          self.username = result["twitch_client"].username
          self.channel = result["twitch_client"].channels[0]
        }
      });
    },
    methods: {
      startBot: function (event) {
        self = this;
        self.status = "connecting";

        chrome.runtime.sendMessage({ type: "connect-to-chat" }, function (result) {
          console.log("get result", result)
          if (result["twitch_client"]) {
            self.username = result["twitch_client"].username
            self.channel = result["twitch_client"].channels[0]
            self.status = "online";
          } else {
            console.log("connection error", result)
            self.error_msg = result.error;
            self.status = "error";
          }
        });
      }
    }
  }
</script>