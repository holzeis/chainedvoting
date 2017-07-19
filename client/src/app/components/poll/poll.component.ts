import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { Poll } from '../../poll';
import { Vote } from '../../vote';
import { User } from '../../user';


import { PollService } from '../../services/poll.service'
import { UserService } from '../../services/user.service'
import { VoteService } from '../../services/vote.service'

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {

  poll: Poll;
  vote: Vote;
  pollID: string;

  public constructor(private voteService: VoteService, private router: Router, private route: ActivatedRoute,
    private pollService: PollService, private userService: UserService) {
      this.route.params.subscribe(params => this.pollID = params['id']);
  }

  ngOnInit(){
    this.getPoll(this.pollID);
  }

  getPoll(pollID: string): void {
    this.pollService.getPoll(pollID).then(poll => {
      console.log("debugging poll service:")
      this.poll = poll;
      console.dir(this.poll);
    });
  }

  setDelegate():void {
    this.router.navigate(['/delegate', this.poll.id]);
  }

  goToVote(poll: Poll):void {
    this.router.navigate(['/vote', poll.id]);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
