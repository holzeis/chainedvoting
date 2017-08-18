package contracts

import (
	"chaincode/entities"
	"chaincode/util"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

//Vote checks a vote and stores it to the blockchain
func Vote(stub shim.ChaincodeStubInterface, args []string) error {
	var vote entities.Vote
	err := json.Unmarshal([]byte(args[0]), &vote)

	if err != nil {
		return err
	}

	fmt.Println("checking input vote object.")

	if vote.ID() == "" {
		return errors.New("vote id must not be null")
	}

	if vote.Option.ID() == "" {
		return errors.New("an option has to be selected")
	}

	if vote.Voter == "" {
		return errors.New("a voter must be provided")
	}

	fmt.Println("check if user has already voted on the poll.")

	pollAsBytes, err := util.GetPollAsBytesByID(stub, vote.PollID)
	if err != nil {
		return err
	}

	if len(pollAsBytes) == 0 {
		return errors.New("Could not find poll by poll id " + vote.PollID)
	}

	var poll entities.Poll
	err = json.Unmarshal(pollAsBytes, &poll)
	if err != nil {
		return err
	}

	for _, pVote := range poll.Votes {
		// check if vote with the same user has already been submitted.
		if pVote.Voter == vote.Voter {
			return errors.New("The user has already voted for this poll")
		}
	}

	fmt.Println("all checks have been successfully passed, hence the vote is stored to the blockchain.")
	err = util.StoreObjectInChain(stub, vote.ID(), util.VotesIndexName, []byte(args[0]))
	if err != nil {
		return err
	}

	fmt.Println("add vote to the poll")
	poll.Votes = append(poll.Votes, vote)

	pollAsBytes, err = json.Marshal(poll)
	if err != nil {
		return err
	}

	util.StoreObjectInChain(stub, poll.ID(), util.PollsIndexName, pollAsBytes)

	fmt.Println("successfully submitted vote to poll!")
	return nil
}
