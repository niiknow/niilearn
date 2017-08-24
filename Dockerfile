FROM node:8-alpine

MAINTAINER friends@niiknow.org

ENV PM2_HOME="/app/.pm2" HOME="/app"

RUN addgroup -g 1001 nodeuser && \
	adduser -D -G nodeuser -s /bin/sh -u 1001 nodeuser && \
	mkdir -p /app/data

WORKDIR /app

ADD . /app/

RUN npm install -g pm2 && \
	npm install --production && \
	mkdir -p /root/.pm2/logs && \
	chown -R nodeuser:nodeuser /root/.pm2 && \
	chown -R nodeuser:nodeuser /app &&  \
	chmod -R 755 /app/data

EXPOSE 8080

VOLUME ["/app/data"]

CMD ["npm", "run", "docker:start"]
