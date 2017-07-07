package util
//File to use for invoke queries that insert things into the blockchain

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"errors"
)

var UsersIndexName = "_users"
var PollsIndexName = "_polls"
var VotesIndexName = "_votes"

func StoreObjectInChain(stub shim.ChaincodeStubInterface, objectID string, indexName string, object []byte) error {
	compositeKey, err := stub.CreateCompositeKey(indexName, []string{objectID})
	if err != nil {
		return errors.New("Create composite key error: " + err.Error())
	}

	thingAsBytes, err := stub.GetState(compositeKey)
	if err != nil {
		return errors.New("Getstate error: " + err.Error())
	}

	if len(thingAsBytes) != 0 {
		return errors.New("Object with ID " + objectID + " already exists")
	}

	err = stub.PutState(compositeKey, object)
	if err != nil {
		return errors.New("Putstate error: " + err.Error())
	}

	return nil
}

func UpdateObjectInChain(stub shim.ChaincodeStubInterface, objectID string, indexName string, object []byte) error {
	compositeKey, err := stub.CreateCompositeKey(indexName, []string{objectID})
	if err != nil {
		return errors.New("Create composite key error: " + err.Error())
	}

	err = stub.PutState(compositeKey, object)
	if err != nil {
		return errors.New("Putstate error: " + err.Error())
	}

	return nil
}