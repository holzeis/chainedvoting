import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Poll } from '../../models/poll';
import { Vote } from '../../models/vote';

import { PollService } from '../../services/poll.service';
import { VoteService } from '../../services/vote.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  title = 'Polls';
  ownPolls: Poll[];
  polls: Poll[] = [];

  // mock user
  mockUserID = 1;

  public constructor(
    private pollService: PollService,
    private voteService: VoteService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.getPolls();

  }
  getPolls(): void {
    this.pollService.getPolls().then(polls => {
        this.ownPolls = polls.filter(poll => poll.owner == this.mockUserID);
        this.voteService.getVotes().then(votes => {
          votes = votes.filter(vote => ((vote.voter == this.mockUserID
            || vote.delegate == this.mockUserID) && !vote.timestamp));
            console.dir(votes);
          for (let vote of votes) {
            this.pollService.getPoll(vote.pollID).then(poll => {
              this.polls.push(poll);
            });
          }
        }).catch(error => this.alertService.error(error));
      }).catch(error => this.alertService.error(error));
  }

  selectPoll(pollID: string): void {
    this.router.navigate(['/poll', pollID]);
  }

  createPoll(): void {
    this.router.navigate(['/create']);
  }

  deletePoll(poll: Poll): void {
    this.voteService.getVotes().then(votes => {
      votes = votes.filter(vote => vote.pollID == poll.id);
      this.pollService.deletePoll(poll.id).then(() => {
        this.ownPolls = this.ownPolls.filter(p => poll !== p);
        for (let vote of votes) {
          this.voteService.deleteVote(vote.id);
          this.polls = this.polls.filter(poll =>  vote.pollID !== poll.id );
        }
        this.alertService.success('Poll id ' + poll.id + ' deleted');
      });
    });
  }
}
