FROM node:8-alpine

MAINTAINER friends@niiknow.org

RUN addgroup -S nodeuser && adduser -S -g nodeuser nodeuser && \
	mkdir -p /app/data && chown -R nodeuser:nodeuser /app

USER nodeuser

WORKDIR /app

ADD . /app/
RUN yarn install --production && \
	yarn --pure-lockfile

EXPOSE 8080

CMD ["yarn", "docker:start"]
