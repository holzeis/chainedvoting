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

  poll: Poll;

  //Mock poll owner
  ownerUser: User = {
    id: '320932870732',
    email: 'tom@aol.com',
    votes: null
  }

  constructor(private pollservice: PollService, private router: Router) {}

  onSubmit(f: NgForm) {

    this.poll = {
      id: '1236',
      name: f.value.name,
      description: f.value.description,
      owner: this.ownerUser,
      validFrom: f.value.validfrom,
      validTo: f.value.validto,
      options: ['First', 'Second', 'Third'],
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

    //console.log("Looking at new poll obj");  // { first: '', last: '' }
    //console.dir(this.poll);  // false
    console.log("Looking at response");  // { first: '', last: '' }

    this.pollservice.createPoll(this.poll)
    .then(res => {
      this.router.navigate(['/dashboard']);
    }).catch(e => console.log("reject: " + e));
  }
}