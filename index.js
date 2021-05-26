const defaultOptions = require('./defaultOptions.js');
const Hangman = require('./hangman.js');

class HangmansManager {

    async create(channel, gameType, options = {}) {

        if (!['custom', 'random'].includes(gameType)) throw new Error('Gamemode must be either \'custom\' or \'random\'');

        let word = options.word || null;
        const messages = options.messages || defaultOptions;
        const displayWordOnGameOver = typeof options.displayWordOnGameOver === 'boolean' ? options.displayWordOnGameOver : true;

        const players = options.players || await this.gatherPlayers(channel, messages, options.filter ? options.filter : () => true);
        if (players.length === 0) return channel.send(messages.createNoPlayers);
        if (gameType === 'custom' && players.length < 2) return channel.send(messages.customNotEnoughPlayers);

        let selector;
        if (gameType === 'custom') {
            await channel.send(messages.customInitMessage.replace(/{players}/gi, players.length));
            // eslint-disable-next-line no-case-declarations
            const userSelection = await this.getWordFromPlayers(players, channel, messages);
            if (userSelection) {
                word = userSelection.word;
                selector = userSelection.selector;
            } else {
                return channel.send(messages.customNoMoreWords);
            }
        }

        const game = new Hangman(word, channel, players, messages, displayWordOnGameOver);
        await game.start();
        return {
            game,
            selector
        };
    }


    gatherPlayersFromMessage(channel, filter) {
        return new Promise(resolve => {
            const players = [];
            const gatherFilter = msg => msg.content.toLowerCase().includes('join') && !msg.author.bot && filter(msg.author);
            const collector = channel.createMessageCollector(gatherFilter, {
                time: 10000
            });
            collector.on('collect', msg => {
                players.push(msg.author);
                msg.delete();
            });
            collector.on('end', async () => {
                resolve(players);
            });
        });
    }

    async gatherPlayersFromReaction(message, emoji, filter) {

        await message.react(emoji);

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async resolve => {
            let players = [];
            const gatherFilter = (r, u) => r.emoji.name === emoji && !u.bot && filter(u);
            const collector = message.createReactionCollector(gatherFilter, {
                time: 10000, dispose: true,
            });
            collector.on('collect', (r, u) => {
                players.push(u)
            });
            collector.on('remove', (r, u) => {
                players = players.filter(p => p.id !== u.id)
            });
            collector.on('end', async () => {
                resolve(players)
            });
        });
    }

    async gatherPlayers(channel, messages, filter) {

        const msg = await channel.send(messages.gatherPlayersMsg);
        const p1 = this.gatherPlayersFromMessage(channel, filter);
        const p2 = this.gatherPlayersFromReaction(msg, '📒', filter);
        const aPlayers = await Promise.all([p1, p2]);
        msg.delete();
        const players = [];
        // join both arrays of players into one of unique players.
        aPlayers.forEach(ps => ps.forEach(p => {
            if (!players.find(pOther => pOther.id == p.id)) {
                players.push(p);
            }
        }));
        return players;
    }

    async getWordFromPlayers(players, channel, messages) {
        let word;
        let chosenOne;
        while (!word && players.length > 1) {
            const index = Math.floor((Math.random() * 1000) % players.length);
            chosenOne = players[index];
            players.splice(index, 1);

            const dm = await chosenOne.createDM();

            await dm.send(messages.getWordFromPlayersDm);
            let finish = false;
            let tries = 0;
            let msgCollection;
            while (!finish && tries < 3) {
                try {
                    msgCollection = await dm.awaitMessages((m) => !m.author.bot, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    }).catch((collected) => {
                        throw collected;
                    });
                } catch (collected) {
                    await dm.send(messages.timesUpDm);
                    await channel.send(messages.timesUpMsg);
                    finish = true;
                    continue;
                }

                const msg = msgCollection.first().content;
                if (msg.match(/^[A-Za-zÀ-ú]{3,}$/)) {
                    word = msg.toLowerCase();
                    finish = true;
                    dm.send(messages.wordSuccess);
                } else {
                    await dm.send(messages.invalidWord);
                    ++tries;
                    if (tries == 3) {
                        await dm.send(messages.tooManyInvalidsWords);
                    }
                }
            }
        }

        if (!word && players.length <= 1) {
            return;
        }

        return {
            word: word,
            selector: chosenOne
        };
    }
}

module.exports = new HangmansManager()
