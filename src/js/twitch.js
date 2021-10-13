tmi = require('tmi.js');

// Simple helper module to create the twitch client.
module.exports = {
  create_client: function(username, password, channels) {
    const tmi_opts = {
      identity: {
        username: username,
        password: password
      },
      channels: channels
    };

    // Create a client with our options
    client = new tmi.client(tmi_opts);
    return client
  }
}