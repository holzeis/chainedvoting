package contracts

import (
	"chaincode/entities"
	"chaincode/util"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// CreatePoll creates a poll
func CreatePoll(stub shim.ChaincodeStubInterface, args []string) error {
	var poll entities.Poll
	err := json.Unmarshal([]byte(args[0]), &poll)

	if err != nil {
		fmt.Println(err)
		return err
	}

	fmt.Println("Going to create poll: " + poll.Name)

	util.StoreObjectInChain(stub, poll.ID(), util.PollsIndexName, []byte(args[0]))

	fmt.Println("Successfully created " + poll.Name)
	return nil
}

// RetrieveAllPolls retrieves all polls stored to the blockchain
func RetrieveAllPolls(stub shim.ChaincodeStubInterface) ([]byte, error) {
	iterator, err := stub.GetStateByPartialCompositeKey(util.PollsIndexName, []string{})
	if err != nil {
		return []byte{}, err
	}
	defer iterator.Close()

	polls := []entities.Poll{}
	for iterator.HasNext() {
		result, err := iterator.Next()
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
