import {Component, OnInit, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Poll, Option} from '../../models/poll';
import {Vote} from '../../models/vote';
import {User} from '../../models/user';

import {PollService} from '../../services/poll.service';
import {VoteService} from '../../services/vote.service';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit {

  public poll: Poll;
  public pollID: string;
  public vote: Vote;

  constructor(
    private pollService: PollService,
    private voteService: VoteService,
    private route: ActivatedRoute,
    private location: Location,
    private alertService: AlertService
  ) {
    this.route.params.subscribe(params => this.pollID = params['id']);
  }

  public ngOnInit() {
    this.getPoll(this.pollID);
  }

  public getPoll(pollID: string): void {
    this.pollService.getPoll(pollID).then(poll => this.poll = poll);
  }

  public submit(option: Option): void {
    console.log('voted for ' + JSON.stringify(option));

    const user: User = JSON.parse(localStorage.getItem('currentUser'));
    const vote = new Vote();
    vote.option = option;
    vote.pollID = this.pollID;
    vote.timestamp = new Date();
    vote.voter = user.email;

    this.voteService.createVote(vote).then(res => {
      this.alertService.success('Your vote has been successfully processed!');
    }).catch(error => this.alertService.error(error));
  }
}
