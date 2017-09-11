FROM node:boron

RUN apt-get install -y git

RUN git clone https://github.com/hyperledger/blockchain-explorer.git /opt/blockchain-explorer

WORKDIR /opt/blockchain-explorer/fabric-explorer

RUN npm install

EXPOSE 8080