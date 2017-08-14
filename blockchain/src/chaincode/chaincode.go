package main

import (
	"chaincode/entities"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("chained-voting")

//======================================================================================================================
//	 Structure Definitions
//======================================================================================================================
//	SimpleChaincode - A blank struct for use with Shim (An IBM Blockchain included go file used for get/put state
//					  and other IBM Blockchain functions)
//==============================================================================================================================
type Chaincode struct {
}

//======================================================================================================================
//	Invoke - Called on chaincode invoke. Takes a function name passed and calls that function. Passes the
//  		 initial arguments passed are passed on to the called function.
//======================================================================================================================

func (t *Chaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	_, args := stub.GetFunctionAndParameters()

	var functionName = args[0]
	args = append(args[:0], args[1:]...)

	logger.Infof("Invoke is running " + functionName)
	fmt.Println(args)

	if functionName == "register" {
		fmt.Println("registering " + args[0])

		var user entities.User
		err := json.Unmarshal([]byte(args[0]), &user)

		if err != nil {
			fmt.Println(err)
			return shim.Error(err.Error())
		}

		fmt.Println("Going to register " + user.Email)
		StoreObjectInChain(stub, user.Email, "user", []byte(args[0]))

		fmt.Println("Successfully registered " + user.Email)
		return shim.Success(nil)
	}

	return shim.Error(fmt.Sprintf("Received unknown invoke function name: '%s'", functionName))
}

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

//======================================================================================================================
//  Main - main - Starts up the chaincode
//======================================================================================================================

func main() {
	// LogDebug, LogInfo, LogNotice, LogWarning, LogError, LogCritical (Default: LogDebug)
	logger.SetLevel(shim.LogInfo)

	logLevel, _ := shim.LogLevel(os.Getenv("SHIM_LOGGING_LEVEL"))
	shim.SetLoggingLevel(logLevel)

	err := shim.Start(new(Chaincode))
	if err != nil {
		fmt.Printf("Error starting SimpleChaincode: %s", err)
	}
}

//======================================================================================================================
//  Init Function - Called when the user deploys the chaincode
//======================================================================================================================
func (t *Chaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Chaincode initialized")

	return shim.Success(nil)
}

//======================================================================================================================
//		Query Functions
//======================================================================================================================
