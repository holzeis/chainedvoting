package main

import (
	"testing"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"encoding/json"
	"main/entities"
	"main/util"
	"errors"
	"time"
)

var vote1 = entities.Vote {
	VoteID:				"vote1",
	Description:		"This is my first vote",
	Timestamp:			time.Now(),
	Voter:				"johndoe@us.ibm.com",
	OptionID:			"like",
	Voting:				"voting1",
}

var vote2 = entities.Vote {
	VoteID:				"vote2",
	Description:		"This is my second vote which was delegated to me",
	Timestamp:			time.Now(),
	Voter:				"mustermann@us.ibm.com",
	OptionID:			"like",
	DelegatedVoter:		"johndoe@us.ibm.com"
	Voting:				"voting1",
}

var vote3 = entities.Vote {
	VoteID:				"vote3",
	Description:		"This is my first vote which was not delegated from me",
	Timestamp:			time.Now(),
	Voter:				"mustermann@us.ibm.com",
	OptionID:			"like",
	Voting:				"voting1",
}

var user1 = entities.User{
	Email:				"johndoe@us.ibm.com",
	MyVotes:			[]entities.Vote{vote1, vote2},
	DelegatedVotes:		[]entities.Vote{vote2},
	MyVotings:			[]entities.Voting{voting1},
	
}

var user2 = entities.User{
	Email:				"mustermann@us.ibm.com",
	MyVotes:			[]entities.Vote{vote2},
	DelegatedVotes:		[]entities.Vote{},
	MyVotings:			[]entities.Voting{},
	
}

var voting1 = entities.Voting{
	VotingID:			"voting1",
	Name:				"The first voting",
	Description:		"only with one option 'like'",
	Owner:				"johndoe@us.ibm.com",
	ValidFrom:			time.Now(),
	ValidTo:			time.Date(9999, 12, 31, 0, 0, 0, 0, time.UTC),
	Options:			[]entities.Option {like},
	Votes:				[]entities.Vote {vote1, vote2},
}

var like = entities.Option{
	OptionID:			"like",
	Description:		"The one and only option",
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
	if err := createVote(stub, vote1); err != nil {
		t.Error(err)
	}
	if err := createVote(stub, vote2); err != nil {
		t.Error(err)
	}
	stub.MockTransactionEnd("CreateVotesDirectlyTx")
}

func Test_WillInvokeCreateVote(t *testing.T) {
	stub := shim.NewMockStub("ex02", new(Chaincode))
	addAllTestData(stub)

	stub.MockTransactionStart("InvokeCreateVoteTx")
	if err := createUser(stub); err != nil {
		t.Error(err)
	}

	payload, _ := json.Marshal(vote3)

	response := stub.MockInvoke("createVote", [][]byte{[]byte(""), []byte("createVote"), []byte(payload)})
	if response.Status == shim.ERROR {
		t.Error(response.Message)
	}
	stub.MockTransactionEnd("InvokeCreateVoteTx")
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

func getUser(stub *shim.MockStub, userID string) (entities.User, error){
	key, err := stub.CreateCompositeKey(util.UsersIndexName, []string{user.UserID})
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

func createUser(stub *shim.MockStub) (error) {
	userAsBytes, _ := json.Marshal(user);
	util.StoreObjectInChain(stub, user.UserID, util.UsersIndexName, userAsBytes)

	storedUser, err := getUser(stub, user.UserID)
	if err != nil {
		return err
	}

	if (user.UserID != storedUser.UserID) {
		return errors.New("Stored ID not the same")
	}
	return nil
}

func createVoting(stub *shim.MockStub) (error) {
	votingAsBytes, _ := json.Marshal(voting1);
	err := util.StoreObjectInChain(stub, voting1.VotingID, util.VotingsIndexName, votingAsBytes)
	if err != nil {
		return err
	}

	storedVoting, err := getVoting(stub, voting1.VotingID)
	if err != nil {
		return err
	}

	if (voting1.VotingID != storedVoting.VotingID) {
		return errors.New("Stored ID not the same")
	}
	return nil
}


func createVote(stub *shim.MockStub, vote *entities.Vote) (error) {
	voteAsBytes, _ := json.Marshal(vote);
	err := util.StoreObjectInChain(stub, vote.VoteID, util.VotesIndexName, voteAsBytes)
	if err != nil {
		return err
	}

	storedVote, err := getVote(stub, vote.VoteID)
	if err != nil {
		return err
	}

	if (vote.VoteID != storedVote.VoteID) {
		return errors.New("Stored ID not the same")
	}
	return err
}

func addAllTestData(stub *shim.MockStub) {
	stub.MockTransactionStart("AddTestDataTx")
	createVoting(stub)
	createVote(stub, vote1)
	createVote(stub, vote2)
	createUser(stub)
	stub.MockTransactionEnd("AddTestDataTx")

}