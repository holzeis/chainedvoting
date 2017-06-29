package main

import (
	"main/entities"
	"main/util"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"os"
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

	if functionName == "addTestdata" {
		err := t.addTestdata(stub, args[0])
		if err != nil {
			return shim.Error(err.Error())
		}

		return shim.Success(nil)
	} else if functionName == "getUser" {
		userAsBytes, err := util.GetUserAsBytesByID(stub, args[0])
		if err != nil {
			return shim.Error(err.Error())
		}

		return shim.Success(userAsBytes)
	}

	return shim.Error(fmt.Sprintf("Received unknown invoke function name: '%s'", functionName))
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
//  Invoke Functions
//======================================================================================================================

func (t *Chaincode) addTestdata(stub shim.ChaincodeStubInterface, testDataAsJson string) error {
	var testData entities.TestData
	err := json.Unmarshal([]byte(testDataAsJson), &testData)
	if err != nil {
		return errors.New("Error while unmarshalling testdata")
	}

	for _, user := range testData.Users {
		userAsBytes, err := json.Marshal(user)
		if err != nil {
			return errors.New("Error marshalling testUser, reason: " + err.Error())
		}

		err = util.StoreObjectInChain(stub, user.Email, util.UsersIndexName, userAsBytes)
		if err != nil {
			return errors.New("error in storing object, reason: " + err.Error())
		}
	}

	return nil
}

//======================================================================================================================
//		Query Functions
//======================================================================================================================
