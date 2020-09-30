const express = require('express');
const bodyParser = require('body-parser');

class httpServer {
    constructor(ajcore) {
        this.ajcore = ajcore;
        const app = express();

        app.use(bodyParser.raw({
            limit: '128kb',
            type: 'text/plain'
        }));

        app.post('/api/core-collector', this.verifyToken.bind(this), (req, res) => {
            this.ajcore.handleHttpRequest(req.token, req.body.toString());
            res.send("OK");
        });

        app.get('*', (req, res) => {
            res.redirect(process.env.REDIRECT_URL);
        });

        app.listen(80, () => console.log('httpServer started'));
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

        if (await this.ajcore.checkUser4Token(req.token)) {
            next();
        } else {
            res.sendStatus(403);
        }
    }
}

module.exports = httpServer;
