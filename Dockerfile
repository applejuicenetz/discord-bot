FROM node:18-alpine

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

ENV NETWORKINFO_URL="http://www.applejuicenet.cc/serverlist/networkinfo.php" \
    BOT_TOKEN="" \
    COLLECTOR_URI="http://localhost:80" \
    DEBUG="DiscordBot:*" \
    PREFIX="!" \
    REDIRECT_URL="https://applejuicenet.cc" \
    STORAGE_PATH="/app/storage"

WORKDIR /app

ADD . /app

RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 && \
            yarn install --production=true && \
            apk del .build-deps

CMD ["node", "index.js"]

EXPOSE 80

VOLUME /app/storage

LABEL org.opencontainers.image.vendor="appleJuiceNETZ" \
      org.opencontainers.image.url="https://applejuicenet.cc" \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.revision=${VCS_REF} \
      org.opencontainers.image.version=${VERSION} \
      org.opencontainers.image.source="https://github.com/applejuicenetz/discord-bot"
