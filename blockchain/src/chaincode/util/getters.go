package util

import (
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
