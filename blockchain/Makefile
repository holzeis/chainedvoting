#
# Note that GOPATH must include the hyperledger fabric under
# 	src/github.com/hyperledger/fabric
# You can get it using 
#	git clone https://gerrit.hyperledger.org/r/fabric
# resp.
#	git clone https://gerrit.hyperledger.org/r/fabric-ca
# in the 
#	src/github.com/hyperledger
# directory. Then checkout the version you like, e.g.
#	git checkout v1.0.0
# in both fabric and fabric-ca
#

PWD=${CURDIR}

all: local

local:
	cd src/chaincode; GOPATH=${GOPATH}:${PWD} go build

test: 
	cd src/chaincode; GOPATH=${GOPATH}:${PWD} go test
