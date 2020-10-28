const debug = require('debug')('DiscordBot:Command:NetworkInfo');
const AsciiTable = require('ascii-table')
const fetch = require('node-fetch');

const Helper = require('../Helper');

class NetworkInfo {
    constructor(bot) {
        bot.registerCommand('stats', this.commandNetworkStats.bind(this));
        bot.registerCommand('serverlist', this.commandServerList.bind(this));
    }

    async getNetworkStats() {
        let payload;

        try {
            payload = await fetch(process.env.NETWORKINFO_URL);
        } catch (e) {
            throw e;
        }

        return await payload.json();
    }

    async commandNetworkStats(message) {
        let stats;

        try {
            stats = await this.getNetworkStats();
        } catch (e) {
            throw e;
        }

        stats.files = Helper.formatNumber(stats.files);
        stats.size = Helper.formatBytes(stats.size);

        let answer = 'appleJuice Network Stats  | `' + stats.server + '` Server  | `' + stats.user + '` User | `' + stats.files + '` Files | `' + stats.size + '` Stuff';

        debug(answer);
        message.reply(answer);
    }

    async commandServerList(message) {
        let stats;

        try {
            stats = await this.getNetworkStats();
        } catch (e) {
            throw e;
        }

        let table = new AsciiTable();
        table.setHeading('Servername', 'Address', 'Port');

        stats.servers.forEach(server => {
            table.addRow(server.name, server.ip, server.port);
        });

        debug('appleJuice Server: `' + stats.server + '` Online');
        message.reply("```" + table.toString() + "```");
    }
}

module.exports = NetworkInfo;
