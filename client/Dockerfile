FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g @angular/cli --loglevel error

# Install app dependencies
COPY package.json /usr/src/app

# Bundle app source
COPY . /usr/src/app/

EXPOSE 4200