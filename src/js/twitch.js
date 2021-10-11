tmi = require('tmi.js');

module.exports = {
  connect_bot: function(username, password, channels) {
    const tmi_opts = {
      identity: {
        username: username,
        password: password
      },
      channels: channels
    };

    // Create a client with our options
    client = new tmi.client(tmi_opts);
    client.connect();

    return client
  }
}