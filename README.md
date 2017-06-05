# chained-voting

https://app.mural.ly/t/blockchaingbs7092/m/blockchaingbs7092/1493976234740

### User story: As a user I am only available on certain dates only if specific person(s) are also attending on the same date.

Eventually, this results into a chained voting, meaning that specific persons can vote with lent votes, if the vote is within the agreed dates..

### Applied on the blockchain: 

 1. Lending a vote: Available dates & representatives are picked and placed as chaincode onto the blockchain.
 2. Regular voting: When voting for a date the smart contract is evaluated and executed if a lend vote applies.

# project setup

### Setup hyperledger fabric alpha-1.0.0-alpha2
TODO: until then please refere to 

http://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html#network-setup


### Start the project
Install the project dependencies with the following command. 

`npm install`

This will download all dependencies required for the build, such as 
* coffee script (java script compiler - http://coffeescript.org/): If you use sublime text 2, you can add syntax highlighting, see http://www.kaspertidemann.com/adding-coffeescript-highlighting-to-sublime-text-2/
* express and 
* hfc (hyperledger fabric node sdk - http://fabric-sdk-node.readthedocs.io/en/latest/node-sdk-indepth/)

Start the http server with the following command.

`npm start`