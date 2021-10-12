<template>
  <div id="app">
    <section class="section">
      <div class="container">
        <h2 class="title">Bot state: {{ connected }}</h2>
      </div>
    </section>
    <section class="section">
      <div class="field is-grouped">
        <div class="control">
          <button class="button" v-on:click="startStopControlledTab">Start bot</button>
        </div>
        <div class="control">
          <button class="button" v-on:click="openSettingsTab">Open settings</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        botname: '',
        connected: false
      }
    },
    mounted: function () {
        var self = this;
        chrome.runtime.sendMessage({ type: "send-status" }, function(result) {
          self.connected = result["connected"]
        });
    },
    methods: {
      openSettingsTab: function (event) {
        chrome.runtime.sendMessage({ type: "open-settings" }, function(result) {
          console.log("Settings opened")
        });
      },
      startStopControlledTab: function(event) {
        self = this;
        chrome.runtime.sendMessage({ type: "connect-to-chat" }, function(result) {
          console.log("get result", result)
          self.msg = result["twitch_client"].username
        });
      }
    }
  }
</script>