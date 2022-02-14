FROM node:16-alpine

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

WORKDIR /app

ADD . /app

RUN apk add --no-cache --virtual .build-deps alpine-sdk python2 && \
            yarn install && \
            apk del .build-deps

CMD ["node", "index.js"]

EXPOSE 80

LABEL org.opencontainers.image.vendor="appleJuiceNETZ" \
      org.opencontainers.image.url="https://applejuicenet.cc" \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.revision=${VCS_REF} \
      org.opencontainers.image.version=${VERSION} \
      org.opencontainers.image.source="https://github.com/applejuicenetz/discord-bot"
