package entities

import "time"

type ECertResponse struct {
	OK string `json:"OK"`
}

type TestData struct {
	Users []User `json:"users"`
}

type TestDataElement interface {
	ID() string
}

type User struct {
	Email     string   `json:"email"`
	MyVotings []Voting `json:"myVotings"`
}

type Vote struct {
	VoteID         string    `json:"voteID"`
	Description    string    `json:"description"`
	Timestamp      time.Time `json:"timestamp"`
	Voter          string    `json:"voter"`
	OptionID       string    `json:"optionID"`
	DelegatedVoter string    `json:"delegatedVoter"`
}

type Voting struct {
	VotingID    string    `json:"votingID"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Owner       string    `json:"owner"`
	ValidFrom   time.Time `json:"validFrom"`
	ValidTo     time.Time `json:"validTo"`
	Options     []Option  `json:"options"`
	Votes       []Vote    `json:"votes"`
}

type Option struct {
	OptionID    string `json:"optionID"`
	Description string `json:"description"`
}

func (t *User) ID() string {
	return t.Email
}

func (t *Vote) ID() string {
	return t.VoteID
}

func (t *Voting) ID() string {
	return t.VotingID
}

func (t *Option) ID() string {
	return t.OptionID
}
