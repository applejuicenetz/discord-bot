const fs = require('fs');

const Database = require('sqlite-async');
const cron = require('node-cron');

const {v4: uuidv4} = require('uuid');

class appleJuiceCore {
    constructor() {
        this.initStorage();

        cron.schedule('*/5 * * * *', () => {
            console.log('running every minute 1, 2, 4 and 5');
        });

    }

    async initStorage() {
        await Database.open(process.env.STORAGE_PATH + '/aj_core.sqlite').then(db => {
            this.db = db;
            console.log('storage initialized');
        }).catch(err => {
            console.error(err);
        });

        let query = fs.readFileSync(__dirname + '/../table.sql').toString();
        this.db.run(query);
    }

    async handleHttpRequest(token, payload) {
        await this.db.run('UPDATE aj_cores SET payload = ?, updated_at = ?  WHERE token = ?', [
            payload,
            new Date().toISOString(),
            token
        ]).then(row => {
            console.log('updated payload for token %s', token);
        }).catch(err => {
            console.error(err);
        });
    }

    async resetToken(message) {
        message.author.send('unbekannter Befehl `' + args[0] + '`');
    }


    async handleMessage(message, args) {
        if (args.length) {
            switch (args[0]) {
                case 'reset':
                    this.resetToken(message);
                    break;

                case 'help':

                    let answer = "Mögliche Befehle:\n" +
                        "`!aj reset` - löschen deine Daten inkl Token\n"
                    ;

                    message.author.send(answer);
                    break;

                default:
                    message.author.send('unbekannter Befehl `' + args[0] + '`');

            }
        }

        if (await this.checkToken4UserId(message.author.id)) {
            this.postMessage(message);
        } else {
            this.createToken(message);
        }
    }

    async postMessage(message) {
        let answer = await this.getPayload4Userid(message.author.id);

        if (answer) {
            message.reply(answer);
        } else {
            message.author.send({
                embed: {
                    title: 'appleJuice Core Information Collector',
                    url: 'https://github.com/applejuicenet/core-information-collector',
                    description: 'Es scheint als hättest Du dieses Tool :point_up_2: noch nicht ausgeführt.'
                }
            });
        }
    }

    async checkUser4Token(token) {
        let ret = false;
        await this.db.get('SELECT user_id FROM aj_cores WHERE token = ?', [token]).then(row => {
            ret = row !== undefined
            console.log('check user_id for token %s (%s)', token, ret);

        }).catch(err => {
            console.error(err);
        });

        return ret;
    }

    async getPayload4Userid(userId) {
        let ret = null;

        await this.db.get('SELECT payload FROM aj_cores WHERE user_id = ?', [userId]).then(row => {
            ret = row.payload;
        }).catch(err => {
            console.error(err);
        });

        return ret;
    }

    async checkToken4UserId(userId) {
        let ret = false;
        await this.db.get('SELECT token FROM aj_cores WHERE user_id = ?', [userId]).then(row => {
            console.log(row);

            ret = row !== undefined
            console.log('check token for userId %s (%s)', userId, ret);

        }).catch(err => {
            console.error(err);
        });

        return ret;
    }

    async createToken(message) {
        let now = new Date().toISOString();
        let token = uuidv4();
        console.log('create token for userId %s', message.author.id);

        await this.db.run('INSERT INTO aj_cores (user_id, token, created_at, updated_at) VALUES  (?,?,?,?)', [
            message.author.id,
            token,
            now,
            now
        ]).then(row => {
            console.log('token for userId %s created (%s)', message.author.id, row.token);

            message.author.send({
                    embed: {
                        color: 0x0099ff,
                        title: 'appleJuice Core Information Collector',
                        url: 'https://github.com/applejuicenet/core-information-collector',
                        description: 'Du benötigst dieses Tool :point_up_2:',
                        fields: [
                            {
                                name: 'Dein Token',
                                value: token
                            }]
                    }
                }
            );
        }).catch(err => {
            console.error(err);
        });
    }
}

module.exports = appleJuiceCore;
