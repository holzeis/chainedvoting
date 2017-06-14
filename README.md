# chained-voting

Please find conceptional documentation in our mural proejct in blockhaingbs.

[blockchain mural](https://app.mural.ly/t/blockchaingbs7092/m/blockchaingbs7092/1493976234740)

## User story: As a user I am only available on certain dates only if specific person(s) are also attending on the same date.

Eventually, this results into a chained voting, meaning that specific persons can vote with lent votes, if the vote is within the agreed dates..

## Applied on the blockchain: 

 1. Lending a vote: Available dates & representatives are picked and placed as chaincode onto the blockchain.
 2. Regular voting: When voting for a date the smart contract is evaluated and executed if a lend vote applies.

## Start the project

The docker images are setup and uploaded to my private repository space on dockerhub "richardholzeis".

start services

```bash
docker-compose up -d
```

stop services

```
docker-compose down
```

This will start 5 containers

1. ca0 - fabric certification authority 
2. orderer.chained-voting.com - orderer service
3. peer0.org.chained-voting.com - endorser for chaincode
4. cli - also a peer and used as command line interface towards the blockchain
5. app - the node js application (not yet connected to the blockchain)

Check the node js application on `http://<docker-machine-ip>:4200/`

## Generate crypto-config & channel artifacts
This is how the crypto-config & channel artifacts are generated.

1. Generate certificates using cryptogen tool
```bash
$CRYPTOGEN generate --config=./crypto-config.yaml
```

2. Replace the private key of the ca in the docker-compose.yaml with the *_sk in  crypto-config/peerOrganizations/org.chained-voting.com/ca/

3. Generating Orderer Genesis block
```bash
$CONFIGTXGEN -profile OrdererGenesis -outputBlock ./channel-artifacts/genesis.block
```

4. Generating channel configuration transaction 'channel.tx'
```bash
$CONFIGTXGEN -profile Channel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID default
```

5. Generating anchor peer update for Org1MSP 
```bash
$CONFIGTXGEN -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/OrgMSPanchors.tx -channelID default -asOrg OrgMSP
```
