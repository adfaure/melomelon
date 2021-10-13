<template>
  <div id="app">
    <div class="container">
      <div class="section">
        <div class="field is-grouped">
          <p class="control">
            <button class="button is-link" v-on:click="refreshPage">Refresh the page</button>
          </p>
        </div>
      </div>
      <section class="section content">
        <p class="title is-1"> Song history </p>
        <p class="subtitle is-3"> History of the current session </p>
        <ul>
          <li v-for="song in song_history">
            {{ song.title }} (<a v-bind:href="song.url">link</a>)
          </li>
        </ul>
      </section>
      <section class="section content">
        <p class="title is-1"> Song stats </p>
        <table class="table">
          <thead>
            <tr>
              <th><abbr title="Song Title">Song title</abbr></th>
              <th><abbr title="Number of time the streamer listened to this song">Number of time Played</abbr></th>
              <th><abbr title="Number of time asked by chat">Number of time asked</abbr></th>
              <th><abbr title="Youtube link">Link</abbr></th>
            </tr>
          </thead>
          <tbody v-for="(nb, song) in stats" :key="song">
            <tr>
              <th>{{ song }}</th>
              <td>{{ nb["playing"] }}</td>
              <td>{{ nb["polled"] }}</td>
              <td><a v-bind:href="nb['url']">{{ nb['url'] }}</a></td>
            </tr>
          </tbody>
        </table>
        <div class="field is-grouped">
          <p class="control">
            <button class="button is-small is-danger" v-on:click="clearStats">Clear</button>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>

  // Needs to be bounded
  function refreshPage() {
    console.log("refreshing", this)
    var self = this;
    chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
      console.log(result)
      self.song_history = result["history"];
    });

    chrome.storage.local.get(["stats"], (result) => {
      console.log("polls", result)
      if (result["stats"]) {
        self.stats = result["stats"];
      } else {
        self.stats = {};
      }
    })
  };

  export default {
    name: 'app',
    data() {
      return {
        song_history: [],
        stats: {}
      }
    },
    mounted: function () {
      refreshPage.bind(this)();
    },
    methods: {
      refreshPage: function () { refreshPage.bind(this)(); },
      clearStats: function () {
        chrome.storage.local.set({ stats: null }, refreshPage.bind(this))
      }
    },
  }
</script>