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

	var request = "{\"id\":\"1\", \"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
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

	var request = "{\"id\":\"1\", \"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
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

func TestRetrieveAllVotes(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("RetrieveAllVotes")

	var request = "{\"id\":\"1\", \"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2017-08-20\",\"options\":[{\"description\":\"option1\"},{\"description\":\"option2\"},{\"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	response = stub.MockInvoke("allVotes", [][]byte{[]byte(""), []byte("allVotes")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	votes := []entities.Vote{}
	json.Unmarshal(response.Payload, &votes)

	if len(votes) != 0 {
		t.Error("Expected number of polls to be 0 but was " + strconv.Itoa(len(votes)))
	}

	stub.MockTransactionEnd("RetrieveAllVotes")
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
		"\"validTo\":\"2017-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response := stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(request)})

	response = stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("1")})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	var poll entities.Poll
	err := json.Unmarshal(response.Payload, &poll)
	if err != nil {
		t.Error(err.Error())
	}

	if len(poll.Options) != 3 {
		t.Error("There should have been 3 options created for this poll")
	}

	stub.MockTransactionEnd("GetPoll")
}

func TestGetPollWithoutPolls(t *testing.T) {
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

func TestVote(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("VoteTx")

	var register = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote = "{\"id\":\"5\",\"option\":{\"id\":\"2\",\"description\":\"option1\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	response = stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("1")})

	var poll entities.Poll
	err := json.Unmarshal(response.Payload, &poll)
	if err != nil {
		t.Error(err.Error())
	}

	if len(poll.Options) != 3 {
		t.Error("There should be 3 options in this poll")
	}

	if len(poll.Votes) != 1 {
		t.Error("Vote should have been added to the poll")
	}

	stub.MockTransactionEnd("VoteTx")
}

func TestVoteForAlreadyVotedPoll(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("VoteTx")

	var register = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\",\"description\":\"option2\"},{\"id\":\"4\",\"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote1 = "{\"id\":\"1\",\"option\":{\"id\":\"2\",\"description\":\"option1\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote1)})

	var vote2 = "{\"id\":\"2\",\"option\":{\"id\":\"2\",\"description\":\"option1\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote2)})

	if response.Status == shim.OK {
		t.Error("User shouldn't be able to vote for the same poll twice")
	}

	stub.MockTransactionEnd("VoteTx")
}

func TestVoteForExpiredPoll(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("VoteTx")

	var register = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2016-08-13\"," +
		"\"validTo\":\"2016-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\",\"description\":\"option2\"},{\"id\":\"4\",\"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote = "{\"id\":\"1\",\"option\":{\"id\":\"2\",\"description\":\"option1\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	if response.Status == shim.OK {
		t.Error("Vote shouldn't be accepted as it is submitted onto an expired poll.")
	}

	stub.MockTransactionEnd("VoteTx")
}

func TestVoteForWithUnregisteredVoter(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("VoteTx")

	var register = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\",\"description\":\"option2\"},{\"id\":\"4\",\"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote = "{\"id\":\"2\",\"option\":{\"id\":\"2\",\"description\":\"option1\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	if response.Status == shim.OK {
		t.Error("Vote shouldn't be accepted as the user hasn't been registered.")
	}

	stub.MockTransactionEnd("VoteTx")
}

func TestVoteForInvalidOption(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("VoteTx")

	var register = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\",\"description\":\"option2\"},{\"id\":\"4\",\"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote = "{\"id\":\"2\",\"option\":{\"id\":\"5\",\"description\":\"option5\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	if response.Status == shim.OK {
		t.Error("Vote shouldn't be accepted as the user has voted for an invalid option.")
	}

	stub.MockTransactionEnd("VoteTx")
}

func TestDelegate(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	response = stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("1")})

	var poll entities.Poll
	err := json.Unmarshal(response.Payload, &poll)
	if err != nil {
		t.Error(err.Error())
	}

	if len(poll.Options) != 3 {
		t.Error("There should be 3 options in this poll")
	}

	if len(poll.Votes) != 1 {
		t.Error("Vote should have been added to the poll")
	}

	var vote = poll.Votes[0]
	if vote.Delegate != "holzeis@at.ibm.com" {
		t.Error("Vote should be delegated")
	}

	if vote.Option != (entities.Option{}) {
		t.Error("Vote shouldn't be set after delegation")
	}

	stub.MockTransactionEnd("DelegateTx")
}

func TestDelegateToAlreadyVotedVoter(t *testing.T) {
	// delegated voter did already vote.
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote = "{\"id\":\"2\",\"option\":{\"id\":\"3\",\"description\":\"option2\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"holzeis@at.ibm.com\"}"
	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"holzeis@at.ibm.com\"}"
	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	if response.Status == shim.OK {
		t.Error("Delegate shouldn't be accepted as the delgated voter already voted.")
	}

	stub.MockTransactionEnd("DelegateTx")
}

func TestDelegateVoteOnExpiredPoll(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2016-08-13\"," +
		"\"validTo\":\"2016-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	if response.Status == shim.OK {
		t.Error("Delegate shouldn't be accepted as it is submitted onto an expired poll.")
	}

	stub.MockTransactionEnd("DelegateTx")
}

func TestDelegateToVoter(t *testing.T) {
	// delegating a vote to the original voter shouldn't be possible
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	if response.Status == shim.OK {
		t.Error("Delegate shouldn't be accepted as it is submitted to the original voter.")
	}

	stub.MockTransactionEnd("DelegateTx")
}

func TestDelegateOfAlreadyVotedVote(t *testing.T) {
	// vote has already been given to an option
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var vote = "{\"id\":\"2\",\"option\":{\"id\":\"3\",\"description\":\"option2\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"holzeis@at.ibm.com\"}"
	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"holzeis@at.ibm.com\", \"delegate\":\"richard.holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	if response.Status == shim.OK {
		t.Error("Delegate shouldn't be accepeted as the vote has already been submitted.")
	}

	stub.MockTransactionEnd("DelegateTx")
}

func TestDelegateToUnregisteredUser(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	if response.Status == shim.OK {
		t.Error("Delegate shouldn't be accepted as the delgate voter hasn't been registered")
	}

	stub.MockTransactionEnd("DelegateTx")
}

func TestMultipleDelegatesToDifferentUsers(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"user1@at.ibm.com\", \"surname\":\"Test\", \"lastname\":\"User1\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"user2@at.ibm.com\", \"surname\":\"Test\", \"lastname\":\"User2\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var register3 = "{\"email\":\"user3@at.ibm.com\", \"surname\":\"Test\", \"lastname\":\"User3\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register3)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate1 = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"user1@at.ibm.com\", \"delegate\":\"user2@at.ibm.com\"}"
	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate1)})
	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	var delegate2 = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"user1@at.ibm.com\", \"delegate\":\"user3@at.ibm.com\"}"
	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate2)})
	if response.Status != shim.OK {
		t.Error(response.Message)
	}
}

func TestVoteForDelegatedVoteWithVoter(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	var vote = "{\"id\":\"2\",\"option\":{\"id\":\"3\",\"description\":\"option2\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\"}"
	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	if response.Status == shim.OK {
		t.Error("Vote shouldn't be accepted as the user isn't the delegated voter")
	}
}

func TestVoteForDelegatedVoteWithDelegate(t *testing.T) {
	stub := shim.NewMockStub("chaincode", new(Chaincode))
	stub.MockTransactionStart("DelegateTx")

	var register1 = "{\"email\":\"richard.holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response := stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register1)})

	var register2 = "{\"email\":\"holzeis@at.ibm.com\", \"surname\":\"Richard\", \"lastname\":\"Holzeis\"}"
	response = stub.MockInvoke("register", [][]byte{[]byte(""), []byte("register"), []byte(register2)})

	var createPoll = "{\"id\":\"1\",\"name\":\"Test Poll\",\"description\":\"this is a test poll\",\"owner\":\"richard.holzeis@at.ibm.com\",\"validFrom\":\"2017-08-13\"," +
		"\"validTo\":\"2099-08-20\",\"options\":[{\"id\":\"2\", \"description\":\"option1\"},{\"id\":\"3\", \"description\":\"option2\"},{\"id\":\"4\", \"description\":\"option3\"}]}"
	response = stub.MockInvoke("createPoll", [][]byte{[]byte(""), []byte("createPoll"), []byte(createPoll)})

	var delegate = "{\"id\":\"5\",\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"richard.holzeis@at.ibm.com\", \"delegate\":\"holzeis@at.ibm.com\"}"

	response = stub.MockInvoke("delegate", [][]byte{[]byte(""), []byte("delegate"), []byte(delegate)})

	var vote = "{\"id\":\"2\",\"option\":{\"id\":\"3\",\"description\":\"option2\"},\"pollID\":\"1\",\"timestamp\":\"2017-08-18T11:57:35.071Z\"," +
		"\"voter\":\"holzeis@at.ibm.com\"}"
	response = stub.MockInvoke("vote", [][]byte{[]byte(""), []byte("vote"), []byte(vote)})

	if response.Status != shim.OK {
		t.Error(response.Message)
	}

	response = stub.MockInvoke("getPoll", [][]byte{[]byte(""), []byte("getPoll"), []byte("1")})

	var poll entities.Poll
	err := json.Unmarshal(response.Payload, &poll)
	if err != nil {
		t.Error(err.Error())
	}

	if len(poll.Votes) != 2 {
		t.Error("The delegated vote should also be voted.")
	}

	if poll.Votes[0].Option.ID() != "3" {
		t.Error("Vote should be for option 2")
	}

	if poll.Votes[1].Option.ID() != "3" {
		t.Error("Vote should be for option 2")
	}
}
