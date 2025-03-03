FROM node:22-alpine

ENV NETWORKINFO_URL="http://www.applejuicenet.cc/serverlist/networkinfo.php" \
    BOT_TOKEN="" \
    COLLECTOR_URI="http://localhost:80" \
    DEBUG="DiscordBot:*" \
    PREFIX="!" \
    REDIRECT_URL="https://applejuicenet.cc" \
    STORAGE_PATH="/app/storage" \
    NODE_ENV="production"

WORKDIR /app

ADD . /app

RUN yarn install

CMD ["node", "index.js"]

EXPOSE 80

VOLUME /app/storage
