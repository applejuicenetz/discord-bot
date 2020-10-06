const debug = require('debug')('DiscordBot:httpServer');
const express = require('express');
const bodyParser = require('body-parser');

class httpServer {
    constructor() {
        this.app = express();

        this.app.use(bodyParser.raw({
            limit: '128kb',
            type: 'text/plain'
        }));

        this.app.get('*', (req, res) => {
            res.redirect(process.env.REDIRECT_URL);
        });

        this.app.listen(80, () => debug('httpServer: started'));
    }
}

module.exports = httpServer;
