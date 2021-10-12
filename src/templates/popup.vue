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
        <button class="button is-link" v-on:click="openSettingsTab">Open settings</button>
      </div>
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
    data() {
      return {
      }
    },
    methods: {
      openSettingsTab: function (event) {
        chrome.runtime.sendMessage({ type: "open-settings" }, function (result) {
          console.log("Settings opened")
        });
      },
    }
  }
</script>