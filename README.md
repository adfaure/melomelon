# Getting started

**Melo Melon** a twitch bot inside a chrome extension to send to your chat the current music playing on YouTube.

## Installation

### Build from sources

Using webpack and npm.

```sh
git clone git@framagit.org:adfaure/melomelon.git
npm install
npx webpack-cli -c webpack.config.js
```

### Download

Download the extension [wip].

### Install the chrome extension

Actually, the extension is not available in the chrome store (and I don't plan to put it here).
The steps are described [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest).

1. Download or build the project.
    - If the project was in an archive file (`.zip`, `.tar`), extract it to place of your convenience.
2. Go to chrome://extensions.
3. Activate developer mode (top-right).
4. Click on Load Unpacked (tol-left of the page).
    - It should open a popup, go to the folder where the extension is located.
5. That's it!

## How to use it

### First usage

To start the bot, open the extension popup in chrome.
This is the main control interface of the bot, and has two layers:
- The top layer must be used to open YouTube.
- The second layer gives information about the bot twitch.
- The last layer gives access to the setting and the statistics.

In the first place, you need to configure the twitch bot. Open the setting page, and provide the needed information to be able to connect the bot to twitch. To get the access token, follow this [link](https://twitchapps.com/tmi/).
- The bot username.
- The access token (must stay private).
- The channel to connect to (typically, your twitch channel).


### Streaming

The bot doesn't spy your tabs. It only get information from the tab it has open (clicking on the open YouTube button on the first layer).
It should open a tab that will be handled by the extension. Whenever a viewer uses the command `!song` (for instance) it will get the information from this tab only.
**In other word, you need to open YouTube with the extension.**

Once you have a tab opened, you can go back to the extension popup and connect the extension to twitch (button *Start bot*).

**Due to some limitation with chrome extension, you need to keep the YouTube tab opened, otherwise the extension will disconnect the twitch bot after some time.**