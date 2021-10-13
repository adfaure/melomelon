<template>
  <div id="app">
    <div class="container">
      <div class="section">
        <div class="">
          <component-youtube></component-youtube>
        </div>
      </div>
      <div class="section">
        <component-twitch></component-twitch>
      </div>
      <div class="section">
        <div class="field is-grouped">
          <p class="control">
            <button class="button is-link" v-on:click="openSettingsTab">Open settings</button>
          </p>
          <p class="control">
            <button class="button is-link" v-on:click="openStats">Stats</button>
          </p>
        </div>
      </div>
      <p class="box content is-small">Extension uptime: {{ uptime }}s</p>
    </div>
  </div>
</template>

<script>
  import componentTwitch from '../templates/twitch.vue'
  import componentYoutube from '../templates/youtube.vue'

  export default {
    name: 'app',
    components: {
      'component-twitch': componentTwitch,
      'component-youtube': componentYoutube,
    },
    mounted: function () {
      var self = this;
      chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
        console.log(result)
        if (result && result["uptime"]) {
          self.uptime = result["uptime"] / 1e3
        }
      });
    },
    data() {
      return {
        uptime: 0
      }
    },
    methods: {
      openStats: function () {
        chrome.tabs.create({ url: 'stats.html' }).then(
          function (newTab) {
            console.log(newTab);
            sendResponse({});
          }).catch(function (err) {
            console.log(err);
            sendResponse({});
          });
      },
      openSettingsTab: function (event) {
        chrome.tabs.create({ url: 'settings.html' }).then(
          function (newTab) {
            console.log(newTab);
            sendResponse({});
          }).catch(function (err) {
            console.log(err);
            sendResponse({});
          });
      },
    }
  }
</script>