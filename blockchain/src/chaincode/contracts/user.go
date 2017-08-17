package contracts

import (
	"chaincode/entities"
	"chaincode/util"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// RegisterUser a user
func RegisterUser(stub shim.ChaincodeStubInterface, args []string) error {
	var user entities.User
	err := json.Unmarshal([]byte(args[0]), &user)

	if err != nil {
		return err
	}
	if user.Email == "" {
		return errors.New("user email must not be null")
	}

	// check if user is already registered
	userAsBytes, err := util.GetUserAsBytesByID(stub, user.Email)
	if err != nil {
		return err
	}

	if len(userAsBytes) != 0 {
		return errors.New("A user with the email: " + user.Email + " has already been registered.")
	}

	fmt.Println("Going to register " + user.Email)
	util.StoreObjectInChain(stub, user.Email, util.UsersIndexName, []byte(args[0]))

	fmt.Println("Successfully registered " + user.Email)
	return nil
}

// GetUser a user
func GetUser(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 1 {
		return []byte{}, errors.New("email is required")
	}

	fmt.Println("Check if " + args[0] + " is already registered.")
	userAsBytes, err := util.GetUserAsBytesByID(stub, args[0])
	if err != nil {
		return []byte{}, err
	}

	if len(userAsBytes) == 0 {
		return []byte{}, errors.New("User with email " + args[0] + " hasn't been registered yet")
	}

	return userAsBytes, err
}

// LoginUser a user
func LoginUser(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 1 {
		return []byte{}, errors.New("email is required")
	}

	fmt.Println("Check if " + args[0] + " is already registered.")
	userAsBytes, err := util.GetUserAsBytesByID(stub, args[0])
	if err != nil {
		return []byte{}, err
	}

	if len(userAsBytes) == 0 {
		return []byte{}, errors.New("User with email " + args[0] + " hasn't been registered yet")
	}

	fmt.Println("Found user; updating last login time.")
	var user entities.User
	err = json.Unmarshal(userAsBytes, &user)
	if err != nil {
		return []byte{}, err
	}

	user.LastLogin = time.Now()

	userAsBytes, err = json.Marshal(user)
	if err != nil {
		return []byte{}, err
	}

	fmt.Println("Updating user to the blockchain.")
	err = util.UpdateObjectInChain(stub, user.Email, util.UsersIndexName, userAsBytes)
	if err != nil {
		return []byte{}, err
	}

	return userAsBytes, nil
}
