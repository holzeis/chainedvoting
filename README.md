# chained-voting

https://app.mural.ly/t/blockchaingbs7092/m/blockchaingbs7092/1493976234740

## User story: As a user I am only available on certain dates only if specific person(s) are also attending on the same date.

Eventually, this results into a chained voting, meaning that specific persons can vote with lent votes, if the vote is within the agreed dates..

## Applied on the blockchain: 

 1. Lending a vote: Available dates & representatives are picked and placed as chaincode onto the blockchain.
 2. Regular voting: When voting for a date the smart contract is evaluated and executed if a lend vote applies.

## Start the project

The docker images are setup and uploaded to my private repository space on dockerhub "richardholzeis".

start services
`docker-compose up -d`

stop services
`docker-compose down`

This will start 5 containers

1. ca0 - fabric certification authority 
2. orderer.chained-voting.com - orderer service
3. peer0.org.chained-voting.com - endorser for chaincode
4. cli - also a peer and used as command line interface towards the blockchain
5. app - the node js application (not yet connected to the blockchain)

Check the node js application on `http://<docker-machine-ip>:3000/`