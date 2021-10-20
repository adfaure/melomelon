# ![](./src/images/icon.svg) Description

MeloMelon is a tool for twitch streamers that listen music from YouTube: MeloMelon forwards the music currently played on YouTube to your twitch chat. Let your viewers know what you are currently listening !

MeloMelon is a bot twitch that connects to your chat and forward the music that you are currently playing with on YouTube. The bot responds to the command !song, and it can be configured to any command you want.

To use the MeloMelon, you only need to connect to twitch with the extension, click on start bot and this is it.  Open a YouTube song on the tab opened by MeloMelon and try typing !song on your chat.

The bot is free, and open source, and respect your privacy. All the data needed for MeloMelon stays on your computer. The source code is available here https://framagit.org/adfaure/melomelon. You are free to use it.

To setup the connection to twitch, the bot requires that you get an access token from https://twitchapps.com/tmi/ (keep the token private). Once, you have a token, open the settings page and provide the information to connect the extension to twitch.

# Getting started

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
