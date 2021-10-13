<template>
  <div id="app">
    <div class="container">
      <section class="section content">
        <p class="title is-1"> Song stats </p>

        <table class="table">
          <thead>
            <tr>
              <th><abbr title="Song Title">Song title</abbr></th>
              <th><abbr title="Number of time asked by chat">Number of time asked</abbr></th>
              <th><abbr title="Number of time the streamer listened to this song">Number of time Played</abbr></th>
            </tr>
          </thead>
          <tbody v-for="(nb, song) in stats" :key="song">
            <tr>
              <th>{{ song }}</th>
              <td>{{ nb["polled"] }}</td>
              <td>{{ nb["playing"] }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="section content">
        <p class="title is-1"> Song history </p>
        <p class="subtitle is-3"> History of the current session </p>
        <ul>
          <li v-for="song in song_history" :key="song.title">
            {{ song.title }} (<a v-bind:href="song.url">link</a>)
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        song_history: [],
        stats: {}
      }
    },
    mounted: function () {
      var self = this;
      chrome.runtime.sendMessage({ type: "send-status" }, function (result) {
        console.log(result)
        self.song_history = result["history"];
      });

      chrome.storage.local.get(["stats"], (result) => {
        console.log("polls", result)
        if (result["stats"]) {
          self.stats = result["stats"];
        }
      })
    }
  }
</script>