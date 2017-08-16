package entities

import (
	"fmt"
	"strings"
	"time"
)

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
	UserID  int64  `json:"userID"`
	Email   string `json:"email"`
	MyPolls []Poll `json:"myPolls"`
}

type Vote struct {
	VoteID         string    `json:"voteID"`
	Description    string    `json:"description"`
	Timestamp      time.Time `json:"timestamp"`
	Voter          string    `json:"voter"`
	OptionID       string    `json:"optionID"`
	DelegatedVoter string    `json:"delegatedVoter"`
}

type Time struct {
	time.Time
}

type Poll struct {
	PollID      string   `json:"pollID"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Owner       int64    `json:"owner"`
	ValidFrom   Time     `json:"validFrom"`
	ValidTo     Time     `json:"validTo"`
	Options     []Option `json:"options"`
	Votes       []Vote   `json:"votes"`
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

func (t *Poll) ID() string {
	return t.PollID
}

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
