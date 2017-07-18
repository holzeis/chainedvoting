import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Poll} from '../../poll';
import {Vote} from '../../vote';
import {PollService} from '../../services/poll.service';
import {VoteService} from '../../services/vote.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})


export class VoteComponent implements OnInit {

  poll: Poll;
  pollID: string;
  vote: Vote;
  // mock user
  mockUserID = '1';
  constructor(
    private pollService: PollService,
    private voteService: VoteService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.params.subscribe(params => this.pollID = params['id']);
    console.log('poll id ' + this.pollID)
  }

  ngOnInit() {

    this.getPoll(this.pollID);

  }

  getPoll(pollID: string): void {
    this.pollService.getPoll(pollID).then(poll => {
      this.poll = poll;
      console.dir(this.poll);
    });
  }

  setVote(option: string):void {
    this.voteService.getVotes().then(vote => {
      this.vote = {
        id: vote[vote.length - 1].id + 1,
        voter: this.mockUserID, //TODO user id
        description: '',
        option: option,
        delegate: null,
        timestamp: new Date().getTime()
      }
      console.dir(this.vote);
      this.voteService.createVote(this.pollID, this.vote).then(()=> this.submitVote());
    });
  }

  goBack(): void {
    this.location.back();
  }

  submitVote():void {
    this.poll.votes.push(this.vote);
    this.pollService.updatePoll(this.poll, this.poll.id).then(res => console.log('Response ' + res));
    this.goBack();
    console.log("See poll obj");
    console.dir(this.poll);
  }

}