import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';

import { Poll } from '../../poll';
import {PollService} from '../../services/poll.service';
import { Vote } from '../../vote';
import {VoteService} from '../../services/vote.service';
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

  constructor(private pollService: PollService, private voteService: VoteService, private router: Router) {}

  splitString(_toSplit: string): string[] {
    return _toSplit.split(';');
  }

  onSubmit(f: NgForm) {

      this.poll = {
        id: null,
        name: f.value.name,
        description: f.value.description,
        owner: this.ownerUser.id,
        validFrom: f.value.validfrom,
        validTo: f.value.validto,
        options: this.splitString(f.value.options)
      }
      this.pollService.createPoll(this.poll, this.splitString(f.value.voters)).then(res => {
        }).then(() => {
          this.router.navigate(['/dashboard']);
        }).catch(e => console.log("reject: " + e));
  }
}