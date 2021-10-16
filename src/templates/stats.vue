<!--
  Stats page. Displays information about the song played and polled by viewers.
-->
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
        <h1 class="title is-1"> Song stats </h1>
        <table class="table">
          <thead>
            <tr>
              <th v-bind:class="[sortedBy == 'title' ? 'is-primary' : 'is-link' ]" v-on:click="sortTitle" class="notification is-light"><abbr title="Song Title">Song
                  title</abbr></th>
              <th v-bind:class="[sortedBy == 'playing' ? 'is-primary' :  'is-link' ]" v-on:click="sortPlayed" class="notification is-light"><abbr
                  title="Number of time the streamer listened to this song">Number of time Played</abbr></th>
              <th v-bind:class="[sortedBy == 'polled' ? 'is-primary' :  'is-link' ]" v-on:click="sortAsked" class="notification is-light"><abbr title="Number of time asked by chat">Number of time asked</abbr></th>
              <th><abbr title="Youtube link">Link</abbr></th>
            </tr>
          </thead>
          <tbody v-for="[key, values] in stats" :key="key">
            <tr>
              <th>{{ key }}</th>
              <td>{{ values["playing"] }}</td>
              <td>{{ values["polled"] }}</td>
              <td><a v-bind:href="values['url']">{{ values['url'] }}</a></td>
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

    chrome.storage.local.get(["stats"], (result) => {
      console.log("polls", result)
      if (result["stats"]) {
        console.log(result["stats"])
        this.stats = Object.entries(result["stats"]);
        this.stats.sort((a, b) => {
          console.log(a)
          return b[1].playing - a[1].playing;
        })
      } else {
        this.stats = {};
      }
    })

  };

  export default {
    name: 'app',
    data() {
      return {
        stats: {},
        sortedBy: 'playing'
      }
    },
    mounted: function () {
      refreshPage.bind(this)();
    },
    methods: {
      sortAsked: function (event) {
        this.stats.sort((a, b) => {
          return b[1].polled - a[1].polled;
        })
        this.sortedBy = 'polled';
      },
      sortTitle: function (event) {
        this.stats.sort((a, b) => {
          return a[0].localeCompare(b[0]);
        })
        this.sortedBy = 'title';
      },
      sortPlayed: function (event) {
        this.stats.sort((a, b) => {
          return b[1].playing - a[1].playing;
        })
        this.sortedBy = 'playing';
      },
      refreshPage: function () { refreshPage.bind(this)(); },
      clearStats: function () {
        chrome.storage.local.set({ stats: null }, refreshPage.bind(this))
      }
    },
  }
</script>