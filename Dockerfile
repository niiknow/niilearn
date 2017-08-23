FROM node:8-alpine

MAINTAINER friends@niiknow.org

RUN addgroup -S nodeuser && adduser -S -g nodeuser nodeuser && \
	mkdir -p /app/data && chown -R nodeuser:nodeuser /app && \
	chmod -R 755 /app

USER nodeuser

WORKDIR /app

ADD . /app/
RUN npm install --production

EXPOSE 8080

VOLUME ["/app/data"]

CMD ["npm", "run", "docker:start"]
