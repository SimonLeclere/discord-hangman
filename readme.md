# Discord Hangman

Discord Hangman is a powerful [Node.js](https://nodejs.org) module that allows you to easily create hangman games on discord !

If you have an idea or a problem, don't hesitate to open an issue :)

## Features

-   ⏱️ Easy to use! Create the game and the module takes care of the rest!
-   ⚙️ Two gamemodes : random and custom !
-   💥 Multiplayer support and auto-gathering players !
-   ✋ Filter: Allow only certain players to join a game !
-   🌐 Support for all languages !

## Description

This module provides the ability to create Hangman games on Discord! You can choose between two game modes: random and custom.
- Random: The word is chosen randomly
- Custom: One of the players is randomly drawn to choose the word

Example : A screenshot of the game

![example](docs/assets/example.png)

## Installation

Require node versions higher than v16.6.0 and Discord.js V14
```js
npm install discord-hangman
```

### Important !!

This module requires the following intents : `GUILDS`, `GUILD_MESSAGES`, `MESSAGE_CONTENT`, `GUILD_MESSAGE_REACTIONS`, `DIRECT_MESSAGES`, `DIRECT_MESSAGE_REACTIONS`

## Documentation

To quickly understand how to use the module, you can read [Getting Started](/docs/gettingStarted.md).

## Credits

This module is inspired by this repo :
https://github.com/Zheoni/Hanger-Bot

Which is unfortunately no longer updated :/

PS : A huge thanks to [@Spongecade](https://github.com/Spongecade) for his help and participation, without him discord-hangman would not be what it is today :)

PS² : Thanks to [@LACOSTAR91](https://github.com/LACOSTAR91) for his participation to the update for support the V13 of Discord.js 
