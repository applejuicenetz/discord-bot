const AsciiTable = require('ascii-table')
const fetch = require('node-fetch');

const Helper = require('./Helper');

class NetworkInfo {
    static NETWORK_INFO = 'https://www.applejuicenet.de/serverlist/networkinfo.php';

    static async getNetworkStats() {
        let payload;

        try {
            payload = await fetch(NetworkInfo.NETWORK_INFO);
        } catch (e) {
            throw e;
        }

        return await payload.json();
    }

    static async sendNetworkStats(message) {
        let stats;

        try {
            stats = await this.getNetworkStats();
        } catch (e) {
            throw e;
        }

        stats.files = Helper.formatNumber(stats.files);
        stats.size = Helper.formatBytes(stats.size);

        let answer = 'appleJuice Network Stats | `' + stats.user + '` User | `' + stats.files + '` Files | `' + stats.size + '` Size';

        console.log(answer);
        message.reply(answer);
    }

    static async sendServerStats(message) {
        let stats;

        try {
            stats = await this.getNetworkStats();
        } catch (e) {
            throw e;
        }

        let answer = 'appleJuice Server: `' + stats.server + '` Online';

        console.log(answer);
        message.reply(answer);
    }

    static async sendServerList(message) {
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

        message.reply("```" + table.toString() + "```");
    }
}

module.exports = NetworkInfo;
