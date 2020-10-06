const fs = require('fs');

const debug = require('debug')('DiscordBot:Main');
const discord = require('discord.js');
const client = new discord.Client();

const httpServer = require('./src/httpServer');

class Bot {
    PREFIX = process.env.PREFIX || '!'

    constructor() {
        this.commands = [];

        this.httpServer = new httpServer();

        this.loadCommands();

        client.on('ready', () => {
            debug('Logged in as', client.user.tag);

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

            // only handle messages with configured prefix
            if (!message.content.startsWith(this.PREFIX)) {
                return;
            }

            const commandBody = message.content.slice(this.PREFIX.length);
            const args = commandBody.split(' ');
            const command = args.shift().toLowerCase();

            if (undefined !== this.commands[command]) {
                this.commands[command](message, args);
            }
        });

        client.login(process.env.BOT_TOKEN);
    }

    registerCommand(cmd, callback) {
        this.commands[cmd] = callback;
    }

    loadCommands() {
        fs.readdirSync(__dirname + '/src/Commands/').forEach(file => {
            if (file.endsWith('.js')) {
                let command = require(__dirname + '/src/Commands/' + file);
                new command(this);
                debug('command registered:', command.name);
            }
        });
    }
}

new Bot();
