const fs = require('fs');

const debug = require('debug')('DiscordBot:Command:appleJuiceCore');
const Database = require('sqlite-async');
const cron = require('node-cron');

const {v4: uuidv4} = require('uuid');

class appleJuiceCore {
    constructor(bot) {

        this.bot = bot;

        bot.registerCommand('aj', this.commandAJ.bind(this));

        this.initStorage();

        this.registerHttpServerEndpoint(bot);

        this.registerCron();
    }

    async commandAJ(message, args) {
        if (args.length) {
            switch (args[0]) {
                case 'reset':
                    this.resetToken(message);
                    break;

                default:
                    let answer = "Mögliche Befehle:\n" +
                        '`' + this.bot.PREFIX + "aj reset` - löschen dein Token inkl. aller Daten\n"
                    ;

                    message.author.send(answer);
                    break;
            }
            return;
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

    registerCron() {
        cron.schedule('*/5 * * * *', () => {
            let now = new Date();
            now.setMinutes(now.getMinutes() - 30); // delete unused tokens older than X minutes
            this.db.run('DELETE FROM aj_cores WHERE payload IS NULL AND created_at <= ?', [now.toISOString()]);
            debug('Cron | deleted unused tokens');
        });

        cron.schedule('*/15 * * * *', () => {
            let now = new Date();
            now.setDate(now.getDate() - 7); // delete outdated rows older than X days
            this.db.run('DELETE FROM aj_cores WHERE updated_at <= ?', [now.toISOString()]);
            debug('Cron | deleted outdated rows');
        });

        debug('cronjobs registered');
    }

    registerHttpServerEndpoint(bot) {
        bot.httpServer.app.post('/api/core-collector', this.verifyToken.bind(this), (req, res) => {
            this.handleHttpRequest(req.token, req.body.toString());
            res.send('OK');
        });

        debug('httpServer Endpoint registered');
    }

    async initStorage() {
        await Database.open(process.env.STORAGE_PATH + '/aj_core.sqlite').then(db => {
            this.db = db;
            debug('storage initialized');
        }).catch(err => {
            debug(err);
        });

        let query = fs.readFileSync(__dirname + '/appleJuiceCore.sql').toString();
        this.db.run(query);
    }

    async handleHttpRequest(token, payload) {
        await this.db.run('UPDATE aj_cores SET payload = ?, updated_at = ?  WHERE token = ?', [
            payload,
            new Date().toISOString(),
            token
        ]).then(row => {
            debug('updated payload for token %s', token);
        }).catch(err => {
            debug(err);
        });
    }

    async resetToken(message) {
        this.db.run('DELETE FROM aj_cores WHERE user_id = ?', [message.author.id]).then(() => {
            message.author.send('Dein Token und die damit verknüpften Daten wurden gelöscht! :white_check_mark: ');
            debug('data for user %s deleted', message.author.id);
        });
    }

    async checkUser4Token(token) {
        let ret = false;
        await this.db.get('SELECT user_id FROM aj_cores WHERE token = ?', [token]).then(row => {
            ret = row !== undefined
        }).catch(err => {
            debug(err);
        });

        return ret;
    }

    async getPayload4Userid(userId) {
        let ret = null;

        await this.db.get('SELECT payload FROM aj_cores WHERE user_id = ?', [userId]).then(row => {
            ret = row.payload;
        }).catch(err => {
            debug(err);
        });

        return ret;
    }

    async checkToken4UserId(userId) {
        let ret = false;
        await this.db.get('SELECT token FROM aj_cores WHERE user_id = ?', [userId]).then(row => {
            ret = row !== undefined
            debug('check token for userId %s (%s)', userId, row.token);

        }).catch(err => {
            debug(err);
        });

        return ret;
    }

    async createToken(message) {
        let now = new Date().toISOString();
        let token = uuidv4();
        debug('create token for userId %s', message.author.id);

        await this.db.run('INSERT INTO aj_cores (user_id, token, created_at, updated_at) VALUES  (?,?,?,?)', [
            message.author.id,
            token,
            now,
            now
        ]).then(() => {
            debug('token for userId %s created', message.author.id);

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
                            }
                        ]
                    }
                }
            );
        }).catch(err => {
            debug(err);
        });
    }

    async verifyToken(req, res, next) {
        const bearerHeader = req.headers['authorization'];

        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
        } else {
            res.sendStatus(403);
        }

        if (await this.checkUser4Token(req.token)) {
            next();
        } else {
            res.sendStatus(403);
        }
    }
}

module.exports = appleJuiceCore;
