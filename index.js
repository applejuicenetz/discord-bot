const discord = require('discord.js');
const client = new discord.Client();

const NetworkInfo = require('./src/NetworkInfo');
const appleJuiceCore = require('./src/appleJuiceCore');
const httpServer = require('./src/httpServer');
const Helper = require('./src/Helper');

class Bot {
    PREFIX = '!'

    constructor() {
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

        const ajcore = new appleJuiceCore();

        new httpServer(ajcore);

        client.on('message', message => {

            // ignore bot messages
            if (message.author.bot) {
                return;
            }

            // only handle messages with ! prefix
            if (!message.content.startsWith(this.PREFIX)) {
                return;
            }

            const commandBody = message.content.slice(this.PREFIX.length);
            const args = commandBody.split(' ');
            const command = args.shift().toLowerCase();

            switch (command) {
                case 'stats':
                    NetworkInfo.sendNetworkStats(message);
                    break

                case 'server':
                    NetworkInfo.sendServerStats(message);
                    break;

                case 'serverlist':
                    NetworkInfo.sendServerList(message);
                    break;

                case 'help':
                    message.reply('Bot Commands: | `!stats` | `!server` | `!serverlist` | `!aj` | `!ping`');
                    break;

                case 'aj':
                    ajcore.handleMessage(message, args);
                    break

                case 'credits':

                    setTimeout(() => {
                        message.author.send('hätte ja mit `!credits` klappen können, oder? :wink:');
                    }, 5000);

                    let rand = Math.random() * 50000000000;
                    let credits = Math.floor(Math.random() * rand) + rand;

                    message.reply('dir wurden `' + Helper.formatBytes(credits) + '` Credits **gutgeschrieben**! :moneybag: :moneybag: :moneybag:');

                    break;

                case 'ping':
                    const timeTaken = Date.now() - message.createdTimestamp;
                    message.reply('Pong! This message had a latency of `' + timeTaken + 'ms`.');
                    break;

                default:
                    console.log('command not known');
            }
        });

        client.login(process.env.BOT_TOKEN);
    }
}

new Bot();
