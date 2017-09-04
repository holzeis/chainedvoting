package entities

import (
	"fmt"
	"strings"
	"time"
)

// User represents the user
type User struct {
	Email     string    `json:"email"`
	Firstname string    `json:"firstname"`
	Lastname  string    `json:"lastname"`
	LastLogin time.Time `json:"lastlogin"`
}

// Vote represents the vote
type Vote struct {
	VoteID    string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Voter     string    `json:"voter"`
	Option    Option    `json:"option"`
	PollID    string    `json:"pollID"`
	Delegate  string    `json:"delegate"`
}

// Time wrapped time for custom date layouts
type Time struct {
	time.Time
}

// Poll represents the poll
type Poll struct {
	PollID      string   `json:"id"`
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
	OptionID    string `json:"id"`
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

// TimeFormat time layout
const TimeFormat = "2006-01-02"

// UnmarshalJSON custom time layout
func (t *Time) UnmarshalJSON(b []byte) error {
	s := string(b)

	// for some reason the quotes are added to the string and have to be removed
	// before parsing.
	s = strings.Trim(s, "\"")

	ret, err := time.Parse(TimeFormat, s)
	if err != nil {
		fmt.Println("Error at parsing time: " + err.Error())
		return err
	}
	t.Time = ret
	return nil
}

// MarshalJSON custom time layout
func (t Time) MarshalJSON() ([]byte, error) {
	if t.Time.UnixNano() == (time.Time{}).UnixNano() {
		return []byte("null"), nil
	}
	s := fmt.Sprintf(`"%s"`, t.Time.Format(TimeFormat))
	return []byte(s), nil
}

// Contains checks if an option is present in a list of options
func Contains(list []Option, x Option) bool {
	for _, item := range list {
		if item == x {
			return true
		}
	}
	return false
}
