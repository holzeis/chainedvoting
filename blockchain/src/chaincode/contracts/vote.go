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

//Delegate delegates a vote to another voter.
func Delegate(stub shim.ChaincodeStubInterface, args []string) error {
	var vote entities.Vote
	err := json.Unmarshal([]byte(args[0]), &vote)
	if err != nil {
		return err
	}

	poll, err := validateDelegate(stub, vote)
	if err != nil {
		return err
	}

	err = addVoteToPoll(stub, poll, vote)
	if err != nil {
		return err
	}

	fmt.Println("saving delegate vote")
	util.UpdateObjectInChain(stub, vote.ID(), util.VotesIndexName, []byte(args[0]))

	fmt.Println("successfully delegated vote to " + vote.Delegate + "!")
	return nil
}

func validateDelegate(stub shim.ChaincodeStubInterface, vote entities.Vote) (entities.Poll, error) {
	if vote.ID() == "" {
		return entities.Poll{}, errors.New("Vote id must not be null")
	}

	if vote.Voter == "" {
		return entities.Poll{}, errors.New("A voter must be provided")
	}

	if vote.Delegate == "" {
		return entities.Poll{}, errors.New("Delegated Voter needs to be provided")
	}

	if vote.Voter == vote.Delegate {
		return entities.Poll{}, errors.New("Cannot delegate a vote to the original voter")
	}

	if vote.Option != (entities.Option{}) {
		return entities.Poll{}, errors.New("Option must not be set when delegating a vote")
	}

	if !userIsRegistered(stub, vote.Voter) {
		return entities.Poll{}, errors.New("Voter is not a registered user")
	}

	if !userIsRegistered(stub, vote.Delegate) {
		return entities.Poll{}, errors.New("Delegated voter is not a registered user")
	}

	poll, err := util.GetPollByID(stub, vote.PollID)
	if err != nil {
		return entities.Poll{}, err
	}

	if pollHasExpired(poll) {
		return entities.Poll{}, errors.New("Poll is already expired")
	}

	if userAlreadyVoted(stub, poll, vote.Voter) {
		return entities.Poll{}, errors.New("The Voter has already voted for this poll")
	}

	if userAlreadyVoted(stub, poll, vote.Delegate) {
		return entities.Poll{}, errors.New("The delegated user has already voted for this poll")
	}

	return poll, nil
}

//Vote checks a vote and stores it to the blockchain
func Vote(stub shim.ChaincodeStubInterface, args []string) error {
	var vote entities.Vote
	err := json.Unmarshal([]byte(args[0]), &vote)
	if err != nil {
		return err
	}

	fmt.Println("validating vote.")
	poll, err := validateVote(stub, vote)
	if err != nil {
		return err
	}

	err = addVoteToPoll(stub, poll, vote)
	if err != nil {
		return err
	}

	err = util.StoreObjectInChain(stub, vote.ID(), util.VotesIndexName, []byte(args[0]))
	if err != nil {
		return err
	}

	fmt.Println("successfully submitted vote to poll!")
	return nil
}

func validateVote(stub shim.ChaincodeStubInterface, vote entities.Vote) (entities.Poll, error) {
	if vote.ID() == "" {
		return entities.Poll{}, errors.New("vote id must not be null")
	}

	if vote.Option.ID() == "" {
		return entities.Poll{}, errors.New("an option has to be selected")
	}

	if vote.Voter == "" {
		return entities.Poll{}, errors.New("a voter must be provided")
	}

	fmt.Println("check if user has already voted on the poll.")

	poll, err := util.GetPollByID(stub, vote.PollID)
	if err != nil {
		return entities.Poll{}, err
	}

	if userAlreadyVoted(stub, poll, vote.Voter) {
		return entities.Poll{}, errors.New("The user has already voted for this poll")
	}

	if pollHasExpired(poll) {
		return entities.Poll{}, errors.New("Poll is already expired")
	}

	if !userIsRegistered(stub, vote.Voter) {
		return entities.Poll{}, errors.New("Voter is not a registered user")
	}

	fmt.Println("check if the option is valid.")
	if !entities.Contains(poll.Options, vote.Option) {
		return entities.Poll{}, errors.New("Voted for invalid option")
	}

	return poll, nil
}

func pollHasExpired(poll entities.Poll) bool {
	fmt.Println("check if the poll is already expired.")
	return poll.ValidTo.Before(time.Now())
}

func userIsRegistered(stub shim.ChaincodeStubInterface, user string) bool {
	fmt.Println("check if the voter is a registered user.")
	userAsBytes, err := util.GetUserAsBytesByID(stub, user)
	if err != nil {
		fmt.Println(err)
		return false
	}
	if len(userAsBytes) == 0 {
		return false
	}
	return true
}

func userAlreadyVoted(stub shim.ChaincodeStubInterface, poll entities.Poll, user string) bool {
	fmt.Println("check if user already voted for the poll")

	for _, pVote := range poll.Votes {
		// check if user has already voted
		if pVote.Voter == user && pVote.Option != (entities.Option{}) {
			return true
		}
	}
	return false
}

func addVoteToPoll(stub shim.ChaincodeStubInterface, poll entities.Poll, vote entities.Vote) error {
	fmt.Println("adding vote to the poll.")
	poll.Votes = append(poll.Votes, vote)

	pollAsBytes, err := json.Marshal(poll)
	if err != nil {
		return err
	}

	err = util.UpdateObjectInChain(stub, poll.ID(), util.PollsIndexName, pollAsBytes)
	if err != nil {
		return err
	}

	return nil
}
