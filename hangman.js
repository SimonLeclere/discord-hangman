const Discord = require('discord.js');
const randomWord = require('random-word');

class hangman {
    constructor(word = null, channel, players, messages, displayWordOnGameOver) {
        this.word = word || randomWord();
        this.lives = 6;
        this.progress = hangman.hyphenString(this.word.length);
        this.remaining = this.word.length;
        this.misses = [];
        this.status = 'in progress';
        this.gameOver = false;
        this.channel = channel;
        this.message = null;
        this.players = players;
        this.messages = messages;
        this.displayWordOnGameOver = displayWordOnGameOver;
    }

    static hyphenString(n) {
        return '-'.repeat(n);
    }

    replaceChar(char) {
        for (let i = 0; i < this.word.length; ++i) {
            if (this.word[i] === char) {
                this.progress = this.progress.substring(0, i) + this.word[i] + this.progress.substring(i + this.word[i].length);
                this.remaining--;
            }
        }
    }

    async showProgress() {
        const embed = new Discord.MessageEmbed()
            .setDescription('```\n' + this.getFigure() + '```')
            .setColor(this.gameOver ? (this.status === 'won' ? '#00CC00' : '#E50000') : '');

        if (this.message) await this.message.edit({
            embed: embed
        });
        else this.message = await this.channel.send({
            embed: embed
        });
    }

    getFigure() {
        return `
     +---+
     |   |      ${this.progress}
     ${this.lives < 6 ? '0' : ' '}   |
    ${this.lives < 4 ? '/' : ' '}${this.lives < 5 ? '|' : ' '}${this.lives < 3 ? '\\' : ' '}  |      ${'❤️'.repeat(this.lives >= 0 ? this.lives : 0) + '🖤'.repeat(6 - this.lives)}
    ${this.lives < 2 ? '/' : ' '} ${this.lives < 1 ? '\\' : ' '}  |      ${this.messages.misses}: ${this.misses.join(' ')}
         |
     =========  ${this.gameOver ? (this.status === 'won' ? this.messages.won : this.messages.gameOver) : ''} ${this.displayWordOnGameOver && this.gameOver && this.status !== 'won' ? this.messages.gameOverMsg.replace(/{word}/gi, this.word) : ''}
        `;
    }

    guess(c) {
        if (this.progress.includes(c)) {
            this.lives--;
        } else if (this.word.includes(c)) {
            this.replaceChar(c);
        } else {
            if (!this.misses.includes(c)) this.misses.push(c);
            this.lives--;
        }

        if (this.lives === 0) this.status = 'lost';
        else if (this.remaining === 0) this.status = 'won';
        return {
            status: this.status,
            progress: this.progress,
            misses: this.misses,
            lifes: this.lives
        };
    }

    guessAll(word) {
        if (this.word === word) {
            this.progress = this.word;
            this.status = 'won';
        } else {
            this.lives--;
        }
        return this.status === 'won';
    }

    async start() {
        await this.showProgress();

        const filter = ((m) => this.players.find((p) => (p.id == m.author.id)));
        const collector = this.channel.createMessageCollector(filter, {
            time: 900000
        });

        return new Promise(resolve => {
            collector.on('collect', async (m) => {

                if (!m.content.match(new RegExp(`^[A-Za-zÀ-ú](?:.{0}|.{${this.word.length - 1}})$`))) return;

                const c = m.content.toLowerCase();
                m.delete();
                if (m.content.length === this.word.length) {
                    if (this.guessAll(c) === false) this.players = this.players.filter(p => p.id !== m.author.id);
                } else if (m.content.length === 1) {
                    this.guess(c);
                } else {
                    return;
                }
                await this.showProgress();

                if (this.status !== 'in progress') {
                    collector.stop();
                } else if (this.players.length < 1) {
                    collector.stop();
                    this.status = 'lost';
                }

            });
            collector.on('end', async () => {
                this.gameOver = true;
                await this.showProgress();
                resolve();
            });
        });
    }


}

module.exports = hangman;
