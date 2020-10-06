const Helper = require('../Helper');

class EasterEgg {
    constructor(bot) {
        bot.registerCommand('credits', this.commandCredits.bind(this));
    }

    commandCredits(message) {
        setTimeout(() => {
            message.author.send('hätte ja mit `!credits` klappen können, oder? :wink:');
        }, 5000);

        let rand = Math.random() * 50000000000;
        let credits = Math.floor(Math.random() * rand) + rand;

        message.reply('dir wurden `' + Helper.formatBytes(credits) + '` Credits **gutgeschrieben**! :moneybag: :moneybag: :moneybag:');
    }
}

module.exports = EasterEgg;
