FROM ubuntu:xenial

RUN mkdir -p /usr/src/app/

# install nodejs
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y build-essential nodejs git python

# use cached layer for node modules
ADD package.json /usr/src/app/package.json

# update npm
RUN npm i -g npm3 && npm3 -g uninstall npm
RUN npm3 i -g npm@5.0.3

# install dependencies
RUN cd /usr/src/app && npm install --loglevel error

#RUN npm cache clear

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN npm run grunt

EXPOSE 3000
