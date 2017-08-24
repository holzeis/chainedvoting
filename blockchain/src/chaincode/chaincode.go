package main

import (
	"chaincode/contracts"
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

	var err error
	var response []byte

	switch functionName {
	case "register":
		err = contracts.RegisterUser(stub, args)
	case "loginUser":
		response, err = contracts.LoginUser(stub, args)
	case "getUser":
		response, err = contracts.GetUser(stub, args)
	case "allUsers":
		response, err = contracts.GetAllUsers(stub)
	case "createPoll":
		err = contracts.CreatePoll(stub, args)
	case "allPolls":
		response, err = contracts.GetAllPolls(stub)
	case "getPoll":
		response, err = contracts.GetPoll(stub, args)
	case "vote":
		err = contracts.Vote(stub, args)
	case "delegate":
		err = contracts.Delegate(stub, args)
	case "allVotes":
		response, err = contracts.RetrieveAllVotes(stub)
	default:
		return shim.Error(fmt.Sprintf("Received unknown invoke function name: '%s'", functionName))
	}

	if err != nil {
		fmt.Println(err.Error())
		return shim.Error(err.Error())
	}

	return shim.Success(response)
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
