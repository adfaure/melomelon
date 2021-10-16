# ![](./src/images/icon.svg) Getting started

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

Download the extension [release 2.0.1](https://framagit.org/adfaure/melomelon/-/jobs/1464820/artifacts/raw/release-v2.0.1.zip).

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

In the first place, you need to configure the twitch bot. Open the setting page, and provide the needed information to be able to connect the bot to twitch. To get the access token, follow this [link](https://twitchapps.com/tmi/).
- The bot username.
- The access token (must stay private).
- The channel to connect to (typically, your twitch channel).

### Streaming

To start the bot, open the extension popup in chrome and click on "start bot"
It will open a youtube tab, when the chat command !song is used, the title of the tab is send to the chat.

The bot doesn't spy your tabs. It only get information from the tab it has open (clicking on the open YouTube button on the first layer).
It should open a tab that will be handled by the extension. Whenever a viewer uses the command `!song` (for instance) it will get the information from this tab only.
**In other word, you need to open YouTube with the extension.**

## Release

### Generate the package

To build the packaging files, use node2nix.

```
node2nix -c release.nix
```

It should generate three files:

- node-env.nix
- node-packages.nix
- release.nix