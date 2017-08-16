

PWD=${CURDIR}

all: local

local:
	cd src/chaincode; GOPATH=${GOPATH}:${PWD} go build

test: 
	cd src/chaincode; GOPATH=${GOPATH}:${PWD} go test
