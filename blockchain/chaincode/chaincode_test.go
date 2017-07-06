package main

import (
	"chained-voting/entities"
	"chained-voting/util"
	"encoding/json"
	"errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"testing"
	"time"
)

var like = entities.Option{
	OptionID:    "like",
	Description: "The one and only option",
}

var vote1 = entities.Vote{
	VoteID:      "vote1",
	Description: "This is my first vote",
	Timestamp:   time.Now(),
	Voter:       "johndoe@us.ibm.com",
	OptionID:    "like",
}

var vote2 = entities.Vote{
	VoteID:         "vote2",
	Description:    "This is my second vote which was delegated to me",
	Timestamp:      time.Now(),
	Voter:          "mustermann@us.ibm.com",
	OptionID:       "like",
	DelegatedVoter: "johndoe@us.ibm.com",
}

var vote3 = entities.Vote{
	VoteID:      "vote3",
	Description: "This is my first vote which was not delegated from me",
	Timestamp:   time.Now(),
	Voter:       "mustermann@us.ibm.com",
	OptionID:    "like",
}

var poll1 = entities.Poll{
	PollID:      "poll1",
	Name:        "The first poll",
	Description: "only with one option 'like'",
	Owner:       "johndoe@us.ibm.com",
	ValidFrom:   time.Now(),
	ValidTo:     time.Date(9999, 12, 31, 0, 0, 0, 0, time.UTC),
	Options:     []entities.Option{like},
	Votes:       []entities.Vote{vote1, vote2},
}

var user1 = entities.User{
	Email:     "johndoe@us.ibm.com",
	MyPolls: []entities.Poll{poll1},
}

var user2 = entities.User{
	Email:     "mustermann@us.ibm.com",
	MyPolls: []entities.Poll{},
}

func Test_WillCreateUserDirectly(t *testing.T) {
	stub := shim.NewMockStub("ex02", new(Chaincode))
	stub.MockTransactionStart("CreateUserDirectlyTx")
	if err := createUser(stub); err != nil {
		t.Error(err)
	}
	stub.MockTransactionEnd("CreateUserDirectlyTx")

}

func Test_WillCreatePollDirectly(t *testing.T) {
	stub := shim.NewMockStub("ex02", new(Chaincode))
	stub.MockTransactionStart("CreatePollDirectlyTx")
	if err := createPoll(stub); err != nil {
		t.Error(err.Error())
	}
	stub.MockTransactionEnd("CreatePollDirectlyTx")
}

func Test_WillCreateVotesDirectly(t *testing.T) {
	stub := shim.NewMockStub("ex02", new(Chaincode))
	stub.MockTransactionStart("CreateVotesDirectlyTx")
	if err := createVote(stub, &vote1); err != nil {
		t.Error(err)
	}
	if err := createVote(stub, &vote2); err != nil {
		t.Error(err)
	}
	stub.MockTransactionEnd("CreateVotesDirectlyTx")
}

func getVote(stub *shim.MockStub, voteId string) (entities.Vote, error) {
	key, err := stub.CreateCompositeKey(util.VotesIndexName, []string{voteId})
	if err != nil {
		return entities.Vote{}, err
	}

	bytes, err := stub.GetState(key)
	if err != nil {
		return entities.Vote{}, err
	}

	storedVote := entities.Vote{}
	err = json.Unmarshal(bytes, &storedVote)
	if err != nil {
		return entities.Vote{}, err
	}
	return storedVote, nil
}

func getPoll(stub *shim.MockStub, pollID string) (entities.Poll, error) {
	key, err := stub.CreateCompositeKey(util.PollsIndexName, []string{pollID})
	if err != nil {
		return entities.Poll{}, err
	}

	bytes, err := stub.GetState(key)
	if err != nil {
		return entities.Poll{}, err
	}

	storedPoll := entities.Poll{}
	err = json.Unmarshal(bytes, &storedPoll)
	if err != nil {
		return entities.Poll{}, err
	}
	return storedPoll, nil
}

func getUser(stub *shim.MockStub, email string) (entities.User, error) {
	key, err := stub.CreateCompositeKey(util.UsersIndexName, []string{email})
	if err != nil {
		return entities.User{}, err
	}

	bytes, err := stub.GetState(key)
	if err != nil {
		return entities.User{}, err
	}

	storedUser := entities.User{}
	err = json.Unmarshal(bytes, &storedUser)
	if err != nil {
		return entities.User{}, err
	}

	return storedUser, nil
}

func createUser(stub *shim.MockStub) error {
	userAsBytes, _ := json.Marshal(user1)
	util.StoreObjectInChain(stub, user1.Email, util.UsersIndexName, userAsBytes)

	storedUser, err := getUser(stub, user1.Email)
	if err != nil {
		return err
	}

	if user1.Email != storedUser.Email {
		return errors.New("Stored ID not the same")
	}
	return nil
}

func createPoll(stub *shim.MockStub) error {
	PollAsBytes, _ := json.Marshal(poll1)
	err := util.StoreObjectInChain(stub, poll1.PollID, util.PollsIndexName, pollAsBytes)
	if err != nil {
		return err
	}

	storedPoll, err := getPoll(stub, poll1.PollID)
	if err != nil {
		return err
	}

	if poll1.PollID != storedPoll.PollID {
		return errors.New("Stored ID not the same")
	}
	return nil
}

func createVote(stub *shim.MockStub, vote *entities.Vote) error {
	voteAsBytes, _ := json.Marshal(vote)
	err := util.StoreObjectInChain(stub, vote.VoteID, util.VotesIndexName, voteAsBytes)
	if err != nil {
		return err
	}

	storedVote, err := getVote(stub, vote.VoteID)
	if err != nil {
		return err
	}

	if vote.VoteID != storedVote.VoteID {
		return errors.New("Stored ID not the same")
	}
	return err
}

func addAllTestData(stub *shim.MockStub) {
	stub.MockTransactionStart("AddTestDataTx")
	createPoll(stub)
	createUser(stub)
	stub.MockTransactionEnd("AddTestDataTx")
}
