const fs = require('fs');

const debug = require('debug')('DiscordBot:Command:appleJuiceCore');
const Database = require('better-sqlite3');
const cron = require('node-cron');

const {v4: uuidv4} = require('uuid');

class appleJuiceCore {
    constructor(bot) {

        if (process.env.COLLECTOR_DOWNLOAD_URL) {
            this.downloadUrl = process.env.COLLECTOR_DOWNLOAD_URL;
        } else {
            this.downloadUrl = 'https://applejuicenetz.github.io/downloads/applejuice-collector/';
        }

        this.bot = bot;

        bot.registerCommand('aj', this.commandAJ.bind(this));

        this.initStorage();

        this.registerHttpServerEndpoint(bot);

        this.registerCron();
    }

    async commandAJ(message, args) {
        if (args.length) {

            let data = await this.getPayload4Userid(message.author.id);

            switch (args[0]) {
                case 'reset':
                    this.resetToken(message);
                    break;

                case 'status':
                    message.author.send({
                            embed: {
                                fields: [
                                    {
                                        name: 'URL für den Collector',
                                        value: process.env.COLLECTOR_URI + '/api/core-collector'
                                    },
                                    {
                                        name: 'Dein persönliches Token',
                                        value: data.token
                                    },
                                    {
                                        name: 'Token erstellt',
                                        value: data.created_at
                                    },

                                    {
                                        name: 'zuletzt empfangene Daten',
                                        value: data.updated_at !== data.created_at ? data.updated_at : 'noch keine Daten'
                                    }
                                ]
                            }
                        }
                    );

                    break;

                default:
                    let answer = "Mögliche Befehle:\n" +
                        '`' + this.bot.PREFIX + "aj reset` - löscht dein Token und alle dazugehörigen Daten\n" +
                        '`' + this.bot.PREFIX + "aj status` - zeigt dir dein Token und einige andere Infos\n"
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

        if (answer && answer.payload) {
            let now = new Date();
            let notify = now.setMinutes(now.getMinutes() - 60);
            let updatedAt = Date.parse(answer.updated_at);

            if (updatedAt < notify) {
                message.author.send('Deine Daten für `' + this.bot.PREFIX + 'aj` sind älter als 60 Minuten!');
            }

            message.reply(answer.payload);
        } else {
            message.author.send({
                embed: {
                    title: 'appleJuice Collector',
                    url: this.downloadUrl,
                    description: ':point_up_2: Es scheint als hättest Du den appleJuice Collector noch nicht ausgeführt.'
                }
            });
        }
    }

    registerCron() {
        cron.schedule('0 * * * *', () => {
            let now = new Date();
            now.setMinutes(now.getMinutes() - 60); // delete unused tokens older than X minutes
            this.db.run('DELETE FROM aj_cores WHERE payload IS NULL AND created_at <= ?', [now.toISOString()]);
            debug('Cron | deleted unused tokens');
        });

        cron.schedule('0 * * * *', () => {
            let now = new Date();
            now.setDate(now.getDate() - 30); // delete outdated rows older than X days
            this.db.run('DELETE FROM aj_cores WHERE updated_at <= ?', [now.toISOString()]);
            debug('Cron | deleted outdated rows');
        });

        debug('cronjobs registered');
    }

    registerHttpServerEndpoint(bot) {
        bot.httpServer.app.post('/api/core-collector', this.verifyToken.bind(this), (req, res) => {
            let payload;
            if (!req.is('application/json')) {
                debug('no valid json payload received', req.body.toString());
                res.sendStatus(400);
                return;
            }

            if (!req.body.forward_line) {
                debug('json payload forward_line missing', req.body.toString());
                res.sendStatus(400);
                return;
            }

            payload = req.body.forward_line;

            if (this.handleHttpRequest(req.token, payload)) {
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            }
        });

        debug('httpServer Endpoint registered');
    }

    initStorage() {
        try {
            this.db = Database(process.env.STORAGE_PATH + '/aj_core.sqlite');
            debug('storage initialized');

        } catch (err) {
            debug(err);
            return;
        }

        let query = fs.readFileSync(__dirname + '/appleJuiceCore.sql').toString();
        this.db.exec(query);
    }

    handleHttpRequest(token, payload) {
        try {
            this.db.prepare('UPDATE aj_cores SET payload = ?, updated_at = ? WHERE token = ?').run(payload, new Date().toISOString(), token);
        } catch (err) {
            debug(err);
            return null;
        }

        debug('updated payload for token %s', token);

        return true;
    }

    resetToken(message) {
        try {
            this.db.prepare('DELETE FROM aj_cores WHERE user_id = ?').run(message.author.id);
            debug('data for user %s deleted', message.author.id);
        } catch (err) {
            debug(err);
            return null;
        }

        message.author.send('Dein Token und die dazu hinterlegten Daten wurden gelöscht! :white_check_mark: ');
    }

    checkUser4Token(token) {
        let ret = false;

        if (!token) {
            return null;
        }

        try {
            ret = this.db.prepare('SELECT user_id FROM aj_cores WHERE token = ?').get(token);
            debug('get user_id for token %s (%s)', token, ret ? ret.user_id : '-1');
        } catch (err) {
            debug(err);
            return null;
        }

        return ret;
    }

    getPayload4Userid(userId) {
        let ret = null;

        try {
            ret = this.db.prepare('SELECT * FROM aj_cores WHERE user_id = ?').get(userId);
            debug('get payload for userId %s (%s)', userId, ret ? ret.token : '-1');
        } catch (err) {
            debug(err);
            return null;
        }

        return ret;
    }

    checkToken4UserId(userId) {
        let ret = false;

        try {
            ret = this.db.prepare('SELECT token FROM aj_cores WHERE user_id = ?').get(userId);
            debug('check token for userId %s (%s)', userId, ret ? ret.token : '-1');
        } catch (err) {
            debug(err);
            return null;
        }

        return ret;
    }

    createToken(message) {
        let now = new Date().toISOString();
        let token = uuidv4();
        debug('create token for userId %s', message.author.id);

        try {
            this.db.prepare('INSERT INTO aj_cores (user_id, token, created_at, updated_at) VALUES  (?,?,?,?)').run(message.author.id, token, now, now);
        } catch (err) {
            debug(err);
            return null;
        }

        debug('token for userId %s created', message.author.id);

        message.author.send({
                embed: {
                    color: 0x0099ff,
                    title: 'appleJuice Collector',
                    url: this.downloadUrl,
                    description: ':point_up_2: Du benötigst dieses Tool',
                    fields: [
                        {
                            name: 'Dein persönliches Token',
                            value: token
                        },
                        {
                            name: 'URL für den Collector',
                            value: process.env.COLLECTOR_URI + '/api/core-collector'
                        },
                        {
                            name: 'weitere hilfe',
                            value: '`' + this.bot.PREFIX + 'aj help`'
                        }
                    ]
                }
            }
        );
    }

    verifyToken(req, res, next) {
        const bearerHeader = req.headers['authorization'];

        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');
            req.token = bearer[1];
        } else {
            res.sendStatus(403);
        }

        if (this.checkUser4Token(req.token)) {
            next();
        } else {
            res.sendStatus(403);
        }
    }
}

module.exports = appleJuiceCore;
