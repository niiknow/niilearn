FROM node:8-alpine

MAINTAINER friends@niiknow.org

RUN addgroup -S nodeuser && adduser -S -g nodeuser nodeuser && \
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
