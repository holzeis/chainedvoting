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

	pollAsBytes, err := util.GetPollAsBytesByID(stub, vote.PollID)
	if err != nil {
		return entities.Poll{}, err
	}

	if len(pollAsBytes) == 0 {
		return entities.Poll{}, errors.New("Could not find poll by poll id " + vote.PollID)
	}

	var poll entities.Poll
	err = json.Unmarshal(pollAsBytes, &poll)
	if err != nil {
		return entities.Poll{}, err
	}

	for _, pVote := range poll.Votes {
		// check if vote with the same user has already been submitted.
		if pVote.Voter == vote.Voter {
			return entities.Poll{}, errors.New("The user has already voted for this poll")
		}
	}

	fmt.Println("check if the poll is already expired.")
	if poll.ValidTo.Before(time.Now()) {
		return entities.Poll{}, errors.New("Poll is already expired")
	}

	return poll, nil
}
