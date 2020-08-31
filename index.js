const discord = require('discord.js');
const fetch = require('node-fetch');
const client = new discord.Client();

const bot = {
    STATS: 'https://www.applejuicenet.de/serverlist/networkinfo.php',
    SERVERS: 'https://www.applejuicenet.de/serverlist/jsonlist.php',

    PREFIX: '!',

    getNetworkStats: async function () {
        let payload;

        try {
            payload = await fetch(bot.STATS);
        } catch (e) {
            throw e;
        }

        return await payload.json();
    },

    getNetworkServer: async function () {
        let payload;

        try {
            payload = await fetch(bot.SERVERS);
        } catch (e) {
            throw e;
        }

        return await payload.json();
    },

    sendNetworkStats: async function (message) {
        let stats;

        try {
            stats = await this.getNetworkStats();
        } catch (e) {
            throw e;
        }

        stats.files = bot.formatNumber(stats.files);
        stats.size = bot.formatBytes(stats.size);

        let returnValue = 'appleJuice Network Stats | `' + stats.user + '` User | `' + stats.files + '` Files | `' + stats.size + '` Size';

        console.log(returnValue);
        message.reply(returnValue);
    },

    sendServerStats: async function (message) {
        let servers;

        try {
            servers = await this.getNetworkServer();
        } catch (e) {
            throw e;
        }

        let returnValue = 'appleJuice Server: `' + servers.length + '` Online';

        console.log(returnValue);
        message.reply(returnValue);
    },

    init: async function () {
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);

            client.user.setPresence({
                status: 'online',
                activity: {
                    name: 'Hilfe mit !help',
                    type: 'PLAYING'
                }
            });
        });

        client.on('message', message => {

            // ignore bot messages
            if (message.author.bot) {
                return;
            }

            // only handle messages with ! prefix
            if (!message.content.startsWith(bot.PREFIX)) {
                return;
            }

            const commandBody = message.content.slice(bot.PREFIX.length);
            const args = commandBody.split(' ');
            const command = args.shift().toLowerCase();

            switch (command) {
                case 'stats':
                    bot.sendNetworkStats(message);
                    break

                case 'server':
                    bot.sendServerStats(message);
                    break;

                case 'help':
                    message.reply('Bot Commands: | `!stats` | `!server` | `!ping`');
                    break;

                case 'ping':
                    const timeTaken = Date.now() - message.createdTimestamp;
                    // message.react('🍏');
                    message.reply('Pong! This message had a latency of `' + timeTaken + 'ms`.');
                    break;

                default:
                    console.log('command not known');
            }
        });

        await client.login(process.env.BOT_TOKEN);
    },

    formatNumber: function (value) {
        let newValue = value;
        if (value >= 1000) {
            let suffixes = ['', 'k', 'm', 'b', 't'];
            let suffixNum = Math.floor(('' + value).length / 3);
            let shortValue = '';
            for (let precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
                let dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                if (dotLessShortValue.length <= 2) {
                    break;
                }
            }
            if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
            newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
    },

    formatBytes: function (bytes) {
        const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const thresh = 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        if (0 === parseInt(bytes)) {
            return bytes;
        }

        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);

        return bytes.toFixed(1) + ' ' + units[u];
    }
};

bot.init();
