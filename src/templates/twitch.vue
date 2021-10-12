<template>
  <div class="content">
    <p class="title is-3">
      Twitch bot
    </p>
    <p class="subtitle is-5">
      <strong>status</strong>: {{ status }}
    </p>
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
        <button class="button" v-on:click="startBot">Start bot</button>
      </div>

    </div>
    <div v-else-if="status === 'online'">
      <ul>
        <li><strong>Connected as:</strong> {{ username }} on channel {{ channel }}</li>
        <li><strong>Polled counter: </strong> {{ nb_time_asked }}</li>
      </ul>
      <p v-if="status == 'online' && !youtube_handled" class="notification is-warning box">
        The bot is connected to twitch, however the youtube tab is not opened yet.
        Due to some limitations with chrome extensions, the connection will be closed soon unless you open youtube with
        the extension (by clicking on "open youtube").
      </p>
    </div>
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
        youtube_handled: false,
        nb_time_asked: 0
      }
    },
    mounted: function () {
      var self = this;
      chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
        if (result && result["twitch_client"] && result["connected"]) {
          console.log(result)
          self.status = result["connected"];
          self.username = result["twitch_client"].username
          self.channel = result["twitch_client"].channels[0]
          self.youtube_handled = result["youtube_handled"]
          self.nb_time_asked = result["nb_time_asked"]
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