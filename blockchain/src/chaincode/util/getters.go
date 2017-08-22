package util

import (
	"chaincode/entities"
	"encoding/json"
	"errors"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// GetUserAsBytesByID gets a user as bytes by id
func GetUserAsBytesByID(stub shim.ChaincodeStubInterface, email string) ([]byte, error) {
	userCompositeKey, err := stub.CreateCompositeKey(UsersIndexName, []string{email})
	if err != nil {
		return nil, errors.New("Create composite key error: " + err.Error())
	}

	userAsBytes, err := stub.GetState(userCompositeKey)
	if err != nil {
		return nil, errors.New("Getstate error: " + err.Error())
	}

	return userAsBytes, nil
}

// GetPollAsBytesByID gets a poll as bytes by id
func GetPollAsBytesByID(stub shim.ChaincodeStubInterface, pollID string) ([]byte, error) {
	pollCompositeKey, err := stub.CreateCompositeKey(PollsIndexName, []string{pollID})
	if err != nil {
		return nil, errors.New("Create composite key error: " + err.Error())
	}

	pollAsBytes, err := stub.GetState(pollCompositeKey)
	if err != nil {
		return nil, errors.New("Getstate error: " + err.Error())
	}

	return pollAsBytes, nil
}

//GetPollByID gets a poll by id
func GetPollByID(stub shim.ChaincodeStubInterface, pollID string) (entities.Poll, error) {
	pollAsBytes, err := GetPollAsBytesByID(stub, pollID)
	if err != nil {
		return entities.Poll{}, err
	}

	if len(pollAsBytes) == 0 {
		return entities.Poll{}, errors.New("Could not find poll by poll id " + pollID)
	}

	var poll entities.Poll
	err = json.Unmarshal(pollAsBytes, &poll)
	if err != nil {
		return entities.Poll{}, err
	}
	return poll, nil
}

// GetVoteAsBytesByID gets a vote as bytes by id
func GetVoteAsBytesByID(stub shim.ChaincodeStubInterface, voteID string) ([]byte, error) {
	voteCompositeKey, err := stub.CreateCompositeKey(VotesIndexName, []string{voteID})
	if err != nil {
		return nil, errors.New("Create composite key error: " + err.Error())
	}

	voteAsBytes, err := stub.GetState(voteCompositeKey)
	if err != nil {
		return nil, errors.New("Getstate error: " + err.Error())
	}

	return voteAsBytes, nil
}
