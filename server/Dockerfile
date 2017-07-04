FROM node:boron

RUN mkdir -p /usr/src/app/

# use cached layer for node modules
ADD package.json /usr/src/app/package.json
RUN cd /usr/src/app/ && npm install --loglevel error
RUN npm cache clear

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN npm run grunt

EXPOSE 3000