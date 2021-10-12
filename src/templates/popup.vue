<template>
  <div id="app">
    <div class="section tile is-ancestor">
      <div class="tile is-vertical">
        <div class="tile">
          <div class="tile is-parent is-vertical">
            <article class="tile is-child notification is-info">
              <component-youtube></component-youtube>
            </article>
            <article class="tile is-child notification is-info">
              <component-twitch></component-twitch>
            </article>
            <article class="tile is-child">
                <!-- Add content or other tiles -->
                <button class="button is-link" v-on:click="openSettingsTab">Open settings</button>
            </article>
          </div>
        </div>
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