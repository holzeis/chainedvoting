FROM node:boron

RUN npm install -g grunt --loglevel error
RUN mkdir -p /usr/src/app/

# use cached layer for node modules
ADD package.json /usr/src/app/package.json
RUN cd /usr/src/app/ && npm install --loglevel error
RUN npm cache clear

ADD . /usr/src/app
WORKDIR /usr/src/app


EXPOSE 3000