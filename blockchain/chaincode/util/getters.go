package util

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"errors"
	"encoding/json"
	"chained-voting/entities"
)

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


func GetAllPollsAsBytes(stub shim.ChaincodeStubInterface) ([]byte, error) {
	pollsResultsIterator, err := stub.GetStateByPartialCompositeKey(PollsIndexName, []string{})
	if err != nil {
		return []byte{}, err
	}
	defer pollsResultsIterator.Close()

	polls := []entities.Poll{}
	for pollsResultsIterator.HasNext() {
		result, err := pollsResultsIterator.Next()
		if err != nil {
			return []byte{}, err
		}

		var poll entities.Poll
		err = json.Unmarshal(result.Value, &poll)
		if err != nil {
			return []byte{}, err
		}

		polls = append(polls, poll)
	}

	return json.Marshal(polls)
}
