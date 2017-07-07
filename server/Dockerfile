FROM node:boron

RUN mkdir -p /usr/src/app/

# use cached layer for node modules
ADD package.json /usr/src/app/package.json
RUN cd /usr/src/app/

ADD . /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000