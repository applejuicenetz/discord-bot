FROM node:14-alpine

ARG BUILD_DATE
ARG VCS_REF

ENV BOT_TOKEN ""

WORKDIR /app

ADD . /app

RUN yarn install

CMD ["node", "index.js"]

LABEL org.label-schema.name="appleJuiceNET Discord Bot" \
      org.label-schema.vcs-ref=${VCS_REF} \
      org.label-schema.build-date=${BUILD_DATE} \
      org.label-schema.vcs-url="https://github.com/applejuicenet/discord-bot" \
      org.label-schema.schema-version="1.0"
