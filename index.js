const defaultOptions = require('./lang/defaultOptions.js');
const defaultFROptions = require('./lang/defaultFROptions.js');
const Hangman = require('./hangman.js');

class HangmansManager {
    async create(interaction, gameType, options = {}) {
        if (!['custom', 'random'].includes(gameType)) throw new Error('Gamemode must be either \'custom\' or \'random\'');

        let word = options.word || null;
        const messages = options.messages || options.lang === "en" ? defaultOptions : defaultFROptions;
        const displayWordOnGameOver = typeof options.displayWordOnGameOver === 'boolean' ? options.displayWordOnGameOver : true;
        const players = options.players || await this.#gatherPlayers(interaction, messages, options.filter ? options.filter : () => true);

        if (players.length === 0) return interaction.reply({ content: messages.createNoPlayers });
        if (gameType === 'custom' && players.length < 2) return interaction.reply({ content: messages.customNotEnoughPlayers });

        let selector;
        if (gameType === 'custom') {
            await interaction.reply({ content: messages.customInitMessage.replace(/{players}/gi, players.length) });
            // eslint-disable-next-line no-case-declarations
            const userSelection = await this.#getWordFromPlayers(players, interaction, messages);
            if (userSelection) { word = userSelection.word; selector = userSelection.selector; } 
            else return interaction.reply({ content: messages.customNoMoreWords });
        }

        const game = new Hangman(word, interaction, players, messages, displayWordOnGameOver);
        await game.start();
        return { game, selector };
    };


    #gatherPlayersFromMessage(interaction, filter) {
        return new Promise(resolve => {
            const players = [];
            const gatherFilter = msg => msg.content.toLowerCase().includes('join') && !msg.author.bot && filter(msg.author);
            const collector = interaction.channel.createMessageCollector({ gatherFilter, time: 10_000 });
            collector.on('collect', msg => { players.push(msg.author); msg.delete(); });
            collector.on('end', async () => resolve(players) );
        });
    };

    async #gatherPlayersFromReaction(botReply, emoji, filter) {
        botReply.react(emoji);
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async resolve => {
            let players = [];
            const gatherFilter = (r, u) => r.emoji.name === emoji && !u.bot && filter(u);
            const collector = botReply.createReactionCollector({ gatherFilter, time: 10_000, dispose: true });
            collector.on('collect', (r, u) => { if(!u.bot) players.push(u) });
            collector.on('remove', (r, u) => { players = players.filter(p => p.id !== u.id ) });
            collector.on('end', async () => { resolve(players); });
        });
    };

    async #gatherPlayers(interaction, messages, filter) {
        await interaction.reply({ content: messages.gatherPlayersMsg });
        const botReply = await interaction.fetchReply();
        const p1 = this.#gatherPlayersFromMessage(interaction, filter);
        const p2 = this.#gatherPlayersFromReaction(botReply, '📒', filter);
        const aPlayers = await Promise.all([p1, p2]);
        botReply.delete();
        const players = [];
        // join both arrays of players into one of unique players.
        aPlayers.forEach(ps => ps.forEach(p => { if (!players.find(pOther => pOther.id == p.id)) players.push(p); }));
        return players;
    };

    async #getWordFromPlayers(players, interaction, messages) {
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
                    const filter = (m) => !m.author.bot;
                    msgCollection = await dm.awaitMessages({ filter, max: 1, time: 30_000, errors: ['time'] })
                    .catch((collected) => { throw collected; });
                } catch (collected) {
                    await dm.send(messages.timesUpDm);
                    await interaction.reply({ content: messages.timesUpMsg });
                    finish = true;
                    continue;
                };

                const msg = msgCollection.first().content;
                if (msg.match(/^[A-Za-zÀ-ú]{3,}$/)) {
                    word = msg.toLowerCase();
                    finish = true;
                    dm.send(messages.wordSuccess);
                } else {
                    await dm.send(messages.invalidWord);
                    ++tries;
                    if (tries == 3) await dm.send(messages.tooManyInvalidsWords);
                };
            };
        };

        if (!word && players.length <= 1) return;
        return { word: word, selector: chosenOne };
    };
};

module.exports = new HangmansManager();
