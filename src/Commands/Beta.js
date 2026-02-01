class Beta {

    constructor(bot) {
        this.betInfoURL = process.env.BETA_INFO_URL || 'https://github.com/applejuicenetz/core/blob/main/BETA.md';
        bot.registerCommand('beta', this.commandBeta.bind(this));
    }

    commandBeta(message) {
        message.reply('Infos zu Beta Versionen: ' + this.betInfoURL);
    }
}

module.exports = Beta;
