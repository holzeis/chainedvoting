package main

import (
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func TestRegisterUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("CreateUserTx")

	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte("{\"email\":\"richard.holzeis@at.ibm.com\"}")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	stub.MockTransactionEnd("CreateUserTx")
}

func TestRegisterUserWithoutEmail(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("CreateUserTx")

	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte("{\"email\":\"\"}")})

	if response.Status == shim.OK {
		t.Error(response.Message + "\nThe email must not be empty!")
	}

	stub.MockTransactionEnd("CreateUserTx")
}

func TestCreatePoll(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("CreatePollTx")

	var request = "{\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":1,\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2017-08-20\",\"options\":[{\"description\":\"option1\"},{\"description\":\"option2\"},{\"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	stub.MockTransactionEnd("CreateUserTx")
}
