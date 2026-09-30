FROM node:24-alpine

ENV NETWORKINFO_URL="http://www.applejuicenet.cc/serverlist/networkinfo.php" \
    COLLECTOR_URI="http://localhost:80" \
    DEBUG="DiscordBot:*" \
    PREFIX="!" \
    REDIRECT_URL="https://applejuicenet.cc" \
    STORAGE_PATH="/app/storage" \
    NODE_ENV="production"

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

CMD ["node", "index.js"]

EXPOSE 80

VOLUME /app/storage
