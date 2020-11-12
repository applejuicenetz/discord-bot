FROM node:14-alpine

ARG BUILD_DATE
ARG VCS_REF

WORKDIR /app

ADD . /app

RUN apk add --no-cache --virtual .build-deps alpine-sdk python && \
            yarn install && \
            apk del .build-deps

CMD ["node", "index.js"]

EXPOSE 80

LABEL org.opencontainers.image.vendor="appleJuiceNET" \
      org.opencontainers.image.url="https://applejuicenet.cc" \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.revision=${VCS_REF} \
      org.opencontainers.image.source="https://github.com/applejuicenetz/discord-bot"
