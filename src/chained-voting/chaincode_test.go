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

var voting1 = entities.Voting{
	VotingID:    "voting1",
	Name:        "The first voting",
	Description: "only with one option 'like'",
	Owner:       "johndoe@us.ibm.com",
	ValidFrom:   time.Now(),
	ValidTo:     time.Date(9999, 12, 31, 0, 0, 0, 0, time.UTC),
	Options:     []entities.Option{like},
	Votes:       []entities.Vote{vote1, vote2},
}

var user1 = entities.User{
	Email:     "johndoe@us.ibm.com",
	MyVotings: []entities.Voting{voting1},
}

var user2 = entities.User{
	Email:     "mustermann@us.ibm.com",
	MyVotings: []entities.Voting{},
}

func Test_WillCreateUserDirectly(t *testing.T) {
	stub := shim.NewMockStub("ex02", new(Chaincode))
	stub.MockTransactionStart("CreateUserDirectlyTx")
	if err := createUser(stub); err != nil {
		t.Error(err)
	}
	stub.MockTransactionEnd("CreateUserDirectlyTx")

}

func Test_WillCreateVotingDirectly(t *testing.T) {
	stub := shim.NewMockStub("ex02", new(Chaincode))
	stub.MockTransactionStart("CreateVotingDirectlyTx")
	if err := createVoting(stub); err != nil {
		t.Error(err.Error())
	}
	stub.MockTransactionEnd("CreateVotingDirectlyTx")
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

func getVoting(stub *shim.MockStub, votingID string) (entities.Voting, error) {
	key, err := stub.CreateCompositeKey(util.VotingsIndexName, []string{votingID})
	if err != nil {
		return entities.Voting{}, err
	}

	bytes, err := stub.GetState(key)
	if err != nil {
		return entities.Voting{}, err
	}

	storedVoting := entities.Voting{}
	err = json.Unmarshal(bytes, &storedVoting)
	if err != nil {
		return entities.Voting{}, err
	}
	return storedVoting, nil
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

func createVoting(stub *shim.MockStub) error {
	votingAsBytes, _ := json.Marshal(voting1)
	err := util.StoreObjectInChain(stub, voting1.VotingID, util.VotingsIndexName, votingAsBytes)
	if err != nil {
		return err
	}

	storedVoting, err := getVoting(stub, voting1.VotingID)
	if err != nil {
		return err
	}

	if voting1.VotingID != storedVoting.VotingID {
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
	createVoting(stub)
	createUser(stub)
	stub.MockTransactionEnd("AddTestDataTx")

}
