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
  }

  constructor(private pollservice: PollService, private router: Router) {}

  onSubmit(f: NgForm) {

    this.pollservice.getPolls().then(polls => {

      this.lastPoll = polls[polls.length - 1 ];
      this.poll = {
        id: this.lastPoll.id + 1,
        name: f.value.name,
        description: f.value.description,
        owner: this.ownerUser.id,
        validFrom: f.value.validfrom,
        validTo: f.value.validto,
        options: ['First', 'Second', 'Third']
      }
      this.pollservice.createPoll(this.poll)
          .then(res => {
            this.router.navigate(['/poll', this.poll.id]);
          }).catch(e => console.log("reject: " + e));
    });
  }
}