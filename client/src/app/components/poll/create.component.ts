import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';

import { Poll } from '../../poll';
import {PollService} from '../../services/poll.service';
import { User } from '../../user';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})

export class CreateComponent {

  poll: Poll
  lastPoll: Poll;

  //Mock poll owner
  ownerUser: User = {
    id: '1',
    email: 'ysadek@ibm.com',
    polls: null
  }

  constructor(private pollservice: PollService, private router: Router) {}

  onSubmit(f: NgForm) {

    this.pollservice.getPolls().then(polls => {

      this.lastPoll = polls[polls.length - 1 ];
      console.dir(this.lastPoll);
      this.poll = {
        id: this.lastPoll.id + 1,
        name: f.value.name,
        description: f.value.description,
        owner: this.ownerUser.id,
        validFrom: f.value.validfrom,
        validTo: f.value.validto,
        options: ['First', 'Second', 'Third'],
        // adding mock vote
        votes:
          [
            {
              id: '32234',
              voter: this.ownerUser,
              description: '',
              option: 'First',
              delegate: null,
              timestamp: 2349764123
            }
          ]
      }
      this.pollservice.createPoll(this.poll)
          .then(res => {
            this.router.navigate(['/poll', this.poll.id]);
          }).catch(e => console.log("reject: " + e));
    });
  }
}