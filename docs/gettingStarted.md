# Getting started

The first step is to require the module.

```js
const hangman = require('discord-hangman');
```

Pretty simple, isn't it? Now you have access to the hangman.create() method!

This method is asynchronous and takes as parameters the channel in which to launch the game, the game mode, and an optional object.

The game mode must be either `'custom'` or `'random'`.

Example :
```js
await hangman.create(message.channel, 'random')
```

## Gamemodes

There are two game modes available, `'custom'` and `'random'`.
- When the game mode is set to `'random'`, the word to guess is drawn at random.
- In `'custom'` mode, a player is randomly chosen to pick the word. This player will not be able to participate in the game afterwards.

## Customize the word

To use a defined word, for example a word in your language, you can use the `option.word` option.

```js
await hangman.create(message.channel, 'random', { word: 'discord' })
```
The word provided must not contain spaces, numbers or special characters. Only uppercase, lowercase and accented letters or not.
If the game mode is set to `'custom'`, this option will be ignored.

## Players option

You can automatically add certain players to a game and start the game by using the `option.players` option.
One particular use of this option, is to automatically start a game with the players value being the message author which creates a quick singleplayer game.

```js
hangman.create(message.channel, 'random', { players: [message.author] })
```
The players value provided must be an array of discord users.

## Filter option

The filter option, allows you determine which people are allowed to join a game. The filter option let's you do this by letting you create your very own function!

```js
await hangman.create(message.channel, 'random', {
    filter: user => message.guild.member(user.id).roles.cache.has('ROLEID')
})
```
This function should return a boolean value (true or false) !

## Translating

You can easily translate the messages of the module into your language by using the `option.messages` option. This option must be an object like this :

```js
{
    createNoPlayers: 'Maybe in another moment... no one joined the game',
    
    customNotEnoughPlayers: 'For a custom word game, there has to be at least 2 players...',
    customInitMessage: '{players} players have joined. Selecting a player to choose the word. Waiting for one of you to respond. Check your DMs!!',
    customNoMoreWords: 'We ran out of players... try again, I\'m sure you can do it better.',

    gatherPlayersMsg: 'Write "join" or react with 📒 to participate in this game! You have 10 seconds.',

    getWordFromPlayersDm: 'You are the chosen one!! Just write the word of your choice. You have 30 seconds. And remember, you can\'t participate in the game',
    timesUpDm: 'Time\'s up sorry, you are disqualified.',
    timesUpMsg: 'The chosen one didn\'t answser... selecting ANOTHER ONE',
    wordSuccess: 'Nice word! Going back to the server.',
    invalidWord: 'Thats not a valid word. No spaces, at least 3 characters.',
    tooManyInvalidsWords: 'Sorry, too many invalid words, try again next game. You are disqualified.',

    misses: 'Misses',
    won: 'You won !',
    gameOver: 'Game over !',
    gameOverMsg: 'The word was {word}'
}
```

## Success messages

By default, the module displays at the end of the game the word to be found in case of a defeat. If you want to use a custom message, you can use the `displayWordOnGameOver` option and a `.then()`.

```js
hangman.create(message.channel, 'random', { displayWordOnGameOver: false }).then(data => {

    if(!data.game) return; // If the game is cancelled or no one joins it

    if (data.game.status === 'won') {
        if (data.selector) message.channel.send(`Congratulations, you found the word! ${data.selector.username}... You should provide a more complicated word next time!`); // data.selector is the user who chose the word (only in custom game mode)

        else message.channel.send('Congratulations you found the word!');
    }
    else if (data.game.status === 'lost') {
        if (data.selector) message.channel.send(`${data.selector.username} Beat you all! The word was ${data.game.word}.`);
        
        else message.channel.send(`You lost! The word was ${data.game.word}.`);
    }
    else {
        message.channel.send('15 minutes have passed! The game is over.'); // If no one answers for 15 minutes
    }

});
```
