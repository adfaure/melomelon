<template>
  <div id="app">
    <div class="container">
      <component-twitch></component-twitch>
      <component-youtube></component-youtube>

      <section class="section">
        <div class="control">
          <button class="button" v-on:click="openSettingsTab">Open settings</button>
        </div>
      </section>
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