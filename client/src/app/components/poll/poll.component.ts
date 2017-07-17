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

  poll: Poll;
  vote: Vote;
  pollID: string;


  public constructor(private router: Router, private route: ActivatedRoute,
    private pollservice: PollService, private votenservice: VoteService) {
      this.route.params.subscribe(params => this.pollID = params['id']);
  }

  ngOnInit(){
    this.getPoll(this.pollID);
  }

  getPoll(pollID: string): void {
    this.pollservice.getPoll(pollID).then(poll => {
      console.log("debugging poll service:")
      console.dir(this.poll);
      this.poll = poll;
    });

  }


  setVote(option: string):void {
    this.vote = {
      id: '', //TODO vote id
      voter: null, //TODO user id
      description: '',
      option: option,
      delegate: null,
      timestamp: new Date().getTime()
    }
    console.dir(this.vote);

  }

  submitVote():void {
    this.poll.votes.push(this.vote);
    this.pollservice.updatePoll(this.poll, this.poll.id).then(res => console.log('Response ' + res));
    this.router.navigate(['/dashboard']);
    console.log("See poll obj");
    console.dir(this.poll);
  }

  setDelegate():void {
    this.router.navigate(['/delegate']);
  }




}
