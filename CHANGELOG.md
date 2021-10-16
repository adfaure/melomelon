[Unreleased]
============

Added
-----

Changed
-------

Removed
-------

Fixed
-----

[2.0.0]
============

Added
-----

- A message is displayed when no song is playing
- Single button to start the bot
  - It opens a youtube tab
  - It starts the twitch connection

Changed
-------

- The background script is now stateless
- The bot twitch is located in the YouTube tab's content script

Removed
-------

- Remove the song history of the current session
- Remove extension uptime in popup
- Remove twitch layer in popup
- Remove youtube layer in popup
- Remove keep alive timeout in settings

Fixed
-----

- Change code structure to prevent twitch from stopping

[1.0.0]
=======

- Release date: 2021-14-10

Added
-----

- MIT LICENSE
- The chrome extension
  - A background service that is alive as long as it has its controlled tab open
  - A settings pages to configure the bot and the credentials to connect to twitch
  - A stats page to see song played
- The nix package to build the production release
- Keep a Changelog: http://keepachangelog.com/en/1.0.0/
- Semantic Versioning: http://semver.org/spec/v2.0.0.html

Changed
-------

Removed
-------

Fixed
-----