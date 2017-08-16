package util

//File to use for invoke queries that insert things into the blockchain

import (
	"errors"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// UsersIndexName users key
var UsersIndexName = "_users"

// PollsIndexName polls key
var PollsIndexName = "_polls"

// VotesIndexName votes key
var VotesIndexName = "_votes"

// StoreObjectInChain stores an object into the blockchain.
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

// UpdateObjectInChain updates an object into the blockchain.
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
