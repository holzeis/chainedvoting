import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Poll } from '../../models/poll';
import { Vote } from '../../models/vote';
import { PollStat } from '../../models/pollstat';

import { PollService } from '../../services/poll.service';
import { UserService } from '../../services/user.service';
import { VoteService } from '../../services/vote.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})

export class PollComponent implements OnInit {

  poll: Poll;
  votes: Vote[];
  pollID: string;
  pollStats: PollStat[] = [];

  public constructor(private voteService: VoteService, private router: Router, private route: ActivatedRoute,
    private pollService: PollService, private userService: UserService) {
      this.route.params.subscribe(params => this.pollID = params['id']);
  }

  ngOnInit() {
    this.getPoll(this.pollID);
    this.getPollStats();
  }

  getPoll(pollID: string): void {
    this.pollService.getPoll(pollID).then(poll => {
      for (const option of poll.options) {
        this.pollStats.push({optionID: option.id, description: option.description, count: 0});
      }
      this.poll = poll;
    });
  }

  getPollStats(): void {
    this.voteService.getVotes().then(votes => {
      votes = votes.filter(vote => vote.pollID === this.pollID);
      for (const pollStat of this.pollStats) {
        for (const vote of votes) {
          if (vote.option.id === pollStat.optionID) {
            pollStat.count++;
          }
        }
      }
    });
  }

  setDelegate(): void {
    this.router.navigate(['/delegate', this.poll.id]);
  }

  goToVote(poll: Poll): void {
    this.router.navigate(['/vote', poll.id]);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
