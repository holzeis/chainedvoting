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

func GetVotingAsBytesByID(stub shim.ChaincodeStubInterface, votingID string) ([]byte, error) {
	votingCompositeKey, err := stub.CreateCompositeKey(VotingsIndexName, []string{votingID})
	if err != nil {
		return nil, errors.New("Create composite key error: " + err.Error())
	}

	votingAsBytes, err := stub.GetState(votingCompositeKey)
	if err != nil {
		return nil, errors.New("Getstate error: " + err.Error())
	}

	return votingAsBytes, nil
}


func GetAllVotingsAsBytes(stub shim.ChaincodeStubInterface) ([]byte, error) {
	votingsResultsIterator, err := stub.GetStateByPartialCompositeKey(VotingsIndexName, []string{})
	if err != nil {
		return []byte{}, err
	}
	defer votingsResultsIterator.Close()

	votings := []entities.Voting{}
	for votingsResultsIterator.HasNext() {
		result, err := votingsResultsIterator.Next()
		if err != nil {
			return []byte{}, err
		}

		var voting entities.Voting
		err = json.Unmarshal(result.Value, &voting)
		if err != nil {
			return []byte{}, err
		}

		votings = append(votings, voting)
	}

	return json.Marshal(votings)
}
