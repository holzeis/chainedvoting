import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { Poll } from '../../poll';
import { Vote } from '../../vote';

import { PollService } from '../../services/poll.service'
import { VoteService } from '../../services/vote.service'


@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {

  pollID: string;
  poll: Poll;

  vote: Vote;

  public constructor(private router: Router, private route: ActivatedRoute,
    private pollservice: PollService, private votenservice: VoteService) {
      console.log("debugging poll service")
      this.route.params.subscribe(params => this.pollID = params['id']);

  }

  ngOnInit(){
    this.getPoll(this.pollID);
  }

  getPoll(pollID: string): void {
    this.pollservice.getPoll(pollID).then(poll => this.poll = poll);
    console.log("debugging poll service: success")
    console.dir(this.poll);
  }

  setVote(option: string):void {
    this.vote = {
      id: '',
      voter: '',
      description: '',
      option: option,
      delegate: '',
      timestamp: new Date().getTime()
    }
    console.dir(this.vote);

  }

  submitVote():void {
    this.poll.votes.push(this.vote);
    this.pollservice.updatePoll(this.poll, this.poll.id);
    this.router.navigate(['/dashboard']);
    console.log("See poll obj");
    console.dir(this.poll);
  }

}
