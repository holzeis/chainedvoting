package contracts

import (
	"chaincode/entities"
	"chaincode/util"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// RegisterUser a user
func RegisterUser(stub shim.ChaincodeStubInterface, args []string) error {
	var user entities.User
	err := json.Unmarshal([]byte(args[0]), &user)

	if err != nil {
		fmt.Println(err)
		return err
	}
	if user.Email == "" {
		return errors.New("user email must not be null")
	}

	fmt.Println("Going to register " + user.Email)
	util.StoreObjectInChain(stub, user.Email, util.UsersIndexName, []byte(args[0]))

	fmt.Println("Successfully registered " + user.Email)
	return nil
}
