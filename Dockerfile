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

LABEL org.label-schema.name="appleJuiceNET Discord Bot" \
      org.label-schema.vcs-ref=${VCS_REF} \
      org.label-schema.build-date=${BUILD_DATE} \
      org.label-schema.vcs-url="https://github.com/applejuicenet/discord-bot" \
      org.label-schema.schema-version="1.0"
