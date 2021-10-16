<!--
  Popup main template.
  It is the main extension interface to connect to twitch and to start youtube.
-->
<template>
  <div id="app">
    <div class="container">
      <div class="section">
        <component-twitch></component-twitch>
      </div>
      <div class="section box">
        <div class="field is-grouped">
          <p class="control">
            <button class="button is-light is-link is-small" v-on:click="openSettingsTab">Open settings</button>
          </p>
          <p class="control">
            <button class="button is-light is-link is-small" v-on:click="openStats">Stats</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import componentTwitch from '../templates/twitch.vue'

  export default {
    name: 'app',
    components: {
      'component-twitch': componentTwitch,
    },
    mounted: function () {
    },
    data() {
      return {
      }
    },
    methods: {
      openStats: function () {
        chrome.tabs.create({ url: 'stats.html' }).then(
          function (newTab) {
            console.log(newTab);
          }).catch(function (err) {
            console.log(err);
          });
      },
      openSettingsTab: function (event) {
        chrome.tabs.create({ url: 'settings.html' }).then(
          function (newTab) {
            console.log(newTab);
          }).catch(function (err) {
            console.log(err);
          });
      },
    }
  }
</script>