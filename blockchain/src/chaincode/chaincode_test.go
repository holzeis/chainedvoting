package main

import (
	"chaincode/entities"
	"encoding/json"
	"strconv"
	"testing"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func TestRegisterUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("CreateUserTx")

	var request = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(request)})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	stub.MockTransactionEnd("CreateUserTx")
}

func TestAlreadyRegisteredUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("CreateUserTx")

	var request = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(request)})

	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(request)})

	if response.Status == shim.OK {
		t.Error("It shouldn't be possible to register the same email address twice.")
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

	var request = "{\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2017-08-20\",\"options\":[{\"description\":\"option1\"},{\"description\":\"option2\"},{\"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	stub.MockTransactionEnd("CreateUserTx")
}

func TestRetrieveAllPolls(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("RetrieveAllPolls")

	var request = "{\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2017-08-20\",\"options\":[{\"description\":\"option1\"},{\"description\":\"option2\"},{\"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	response = stub.MockInvoke("allPolls", [][]byte{[]byte(""), []byte("allPolls")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	polls := []entities.Poll{}
	json.Unmarshal(response.Payload, &polls)

	if len(polls) != 1 {
		t.Error("Expected number of polls to be 1 but was " + strconv.Itoa(len(polls)))
	}

	stub.MockTransactionEnd("RetrieveAllPolls")
}

func TestLoginUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("LoginUser")

	var request = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(request)})

	response = stub.MockInvoke("loginUser", [][]byte{[]byte(""), []byte("loginUser"), []byte("richard.holzeis@at.ibm.com")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	var user entities.User
	json.Unmarshal(response.Payload, &user)

	zeroTime := time.Time{}
	if user.LastLogin == zeroTime {
		t.Error("timestamp should be set at login")
	}

	stub.MockTransactionEnd("LoginUser")
}

func TestLoginUserWithoutRegistration(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("LoginUser")

	response := stub.MockInvoke("loginUser", [][]byte{[]byte(""), []byte("loginUser"), []byte("richard.holzeis@at.ibm.com")})

	if response.Status == shim.OK {
		t.Error("User should not be able to login as he isn't registered yet.")
	}

	stub.MockTransactionEnd("LoginUser")
}

func TestLoginUserWithoutRegistrationButExistingUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("LoginUser")

	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte("{\"email\":\"holzeis@at.ibm.com\"}")})

	response = stub.MockInvoke("loginUser", [][]byte{[]byte(""), []byte("loginUser"), []byte("richard.holzeis@at.ibm.com")})

	if response.Status == shim.OK {
		t.Error("User should not be able to login as he isn't registered yet.")
	}

	stub.MockTransactionEnd("LoginUser")
}

func TestGetUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("GetUser")

	var request = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(request)})

	response = stub.MockInvoke("getUser", [][]byte{[]byte(""), []byte("getUser"), []byte("richard.holzeis@at.ibm.com")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	var user entities.User
	err := json.Unmarshal(response.Payload, &user)
	if err != nil {
		t.Error(err.Error())
	}

	stub.MockTransactionEnd("GetUser")
}

func TestGetUserWithoutRegistration(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("GetUser")

	response := stub.MockInvoke("getUser", [][]byte{[]byte(""), []byte("getUser"), []byte("richard.holzeis@at.ibm.com")})

	if response.Status == shim.OK {
		t.Error("User should not be found as he isn't registered yet.")
	}

	stub.MockTransactionEnd("GetUser")
}

func TestGetUserWithoutRegistrationButExistingUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("GetUser")

	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte("{\"email\":\"holzeis@at.ibm.com\"}")})

	response = stub.MockInvoke("getUser", [][]byte{[]byte(""), []byte("getUser"), []byte("richard.holzeis@at.ibm.com")})

	if response.Status == shim.OK {
		t.Error("User should not be found as he isn't registered yet.")
	}

	stub.MockTransactionEnd("GetUser")
}

func TestGetPoll(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("GetPoll")

	var request = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2017-08-20\",\"options\":[{\"description\":\"option1\"},{\"description\":\"option2\"},{\"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	response = stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("1")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	var user entities.User
	err := json.Unmarshal(response.Payload, &user)
	if err != nil {
		t.Error(err.Error())
	}

	stub.MockTransactionEnd("GetPoll")
}

func TestGGetPollWithoutPolls(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("GetPoll")

	response := stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("1")})

	if response.Status == shim.OK {
		t.Error("Poll should not be found as it hasn't been created")
	}

	stub.MockTransactionEnd("GetPoll")
}

func TestGetPollWithoutCreatedPollButExistingPolls(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("GetPoll")

	var request = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2017-08-20\",\"options\":[{\"description\":\"option1\"},{\"description\":\"option2\"},{\"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	response = stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("2")})

	if response.Status == shim.OK {
		t.Error("Poll should not be found as it hasn't been created")
	}

	stub.MockTransactionEnd("GetPoll")
}
