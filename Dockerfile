FROM node:8-alpine

MAINTAINER friends@niiknow.org

RUN addgroup -g 1001 nodeuser && \
	adduser -D -G nodeuser -s /bin/false -u 1001 nodeuser && \
	mkdir -p /app/data

WORKDIR /app

ADD . /app/
RUN npm install --production && \
	chown -R nodeuser:nodeuser /app && \
	chmod -R 755 /app/data

USER nodeuser

EXPOSE 8080

VOLUME ["/app/data"]

CMD ["npm", "run", "docker:start"]
