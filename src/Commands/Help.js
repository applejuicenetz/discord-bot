class Help {
    constructor(bot) {
        bot.registerCommand('help', this.commandHelp.bind(this));
        bot.registerCommand('ping', this.commandPing.bind(this));
        this.bot = bot;
    }

    commandHelp(message) {
        let cmdKeys = Object.keys(this.bot.commands);

        message.reply('Bot Commands: `' + this.bot.PREFIX + cmdKeys.join('` | `' + this.bot.PREFIX) + '`');
    }

    commandPing(message) {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply('Pong! This message had a latency of `' + timeTaken + 'ms`.');
    }
}

module.exports = Help;
