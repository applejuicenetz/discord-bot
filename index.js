const fs = require('fs');

const debug = require('debug')('DiscordBot:Main');
const {Client, Events, GatewayIntentBits, Partials} = require('discord.js');

const httpServer = require('./src/httpServer');

class Bot {
    PREFIX = process.env.PREFIX || '!'

    constructor() {
        this.commands = [];

        this.httpServer = new httpServer();

        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageReactions,
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction
            ]
        });

        this.loadCommands();

        client.on(Events.ClientReady, () => {
            debug('Logged in as %s and handle prefix "%s"', client.user.tag, this.PREFIX);

            client.user.setPresence({
                status: 'online',
                activity: {
                    name: 'Hilfe mit !help',
                    type: 'PLAYING'
                }
            });
        });

        client.on(Events.MessageCreate, message => {
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
