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

	util.StoreObjectInChain(stub, poll.Name, util.PollsIndexName, []byte(args[0]))

	fmt.Println("Successfully created " + poll.Name)
	return nil
}
