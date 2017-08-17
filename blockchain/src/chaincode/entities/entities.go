package entities

import (
	"fmt"
	"strings"
	"time"
)

// User represents the user
type User struct {
	Email    string `json:"email"`
	Surname  string `json:"surname"`
	Lastname string `json:"lastname"`
}

// Vote represents the vote
type Vote struct {
	VoteID         string    `json:"voteID"`
	Description    string    `json:"description"`
	Timestamp      time.Time `json:"timestamp"`
	Voter          string    `json:"voter"`
	OptionID       string    `json:"optionID"`
	DelegatedVoter string    `json:"delegatedVoter"`
}

// Time wrapped time for custom date layouts
type Time struct {
	time.Time
}

// Poll represents the poll
type Poll struct {
	PollID      string   `json:"pollID"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Owner       string   `json:"owner"`
	ValidFrom   Time     `json:"validFrom"`
	ValidTo     Time     `json:"validTo"`
	Options     []Option `json:"options"`
	Votes       []Vote   `json:"votes"`
}

// Option represent an option of a poll
type Option struct {
	OptionID    string `json:"optionID"`
	Description string `json:"description"`
}

// ID returns the emal address of the user
func (t *User) ID() string {
	return t.Email
}

// ID returns the unique id of the vote
func (t *Vote) ID() string {
	return t.VoteID
}

// ID returns the unique id of the poll
func (t *Poll) ID() string {
	return t.PollID
}

// ID returns the unique id of the option
func (t *Option) ID() string {
	return t.OptionID
}

// UnmarshalJSON custom time layout
func (t *Time) UnmarshalJSON(b []byte) error {
	s := string(b)

	// for some reason the quotes are added to the string and have to be removed
	// before parsing.
	s = strings.Trim(s, "\"")

	ret, err := time.Parse("2006-01-02", s)
	if err != nil {
		fmt.Println("Error at parsing time: " + err.Error())
		return err
	}
	t.Time = ret
	return nil
}
