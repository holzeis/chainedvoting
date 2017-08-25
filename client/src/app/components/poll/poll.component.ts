import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Poll } from '../../models/poll';
import { Vote } from '../../models/vote';
import { PollStat } from '../../models/pollstat';

import { PollService } from '../../services/poll.service';
import { UserService } from '../../services/user.service';
import { VoteService } from '../../services/vote.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {

  public poll: Poll;
  public votes: Vote[];
  public pollID: string;
  public pollStats: PollStat[] = [];

  public constructor(private voteService: VoteService, private router: Router, private route: ActivatedRoute,
    private pollService: PollService, private userService: UserService, private alertService: AlertService) {
      this.route.params.subscribe(params => this.pollID = params['id']);
  }

  public ngOnInit() {
    const getpoll: Promise<any> = this.pollService.getPoll(this.pollID);
    const votes: Promise<any> = this.voteService.getVotes();
    Promise.all([getpoll, votes]).then((results) => {
      this.poll = results[0];
      for (const option of this.poll.options) {
        this.pollStats.push({optionID: option.id, description: option.description, count: 0});
      }

      this.votes = results[1];
      for (const pollStat of this.pollStats) {
        for (const vote of this.votes) {
          if (vote.option.id === pollStat.optionID) {
            pollStat.count++;
          }
        }
      }

    }).catch(e => this.alertService.error(e));
  }

  public delegate(): void {
    this.router.navigate(['/delegate', this.poll.id]);
  }

  public vote(poll: Poll): void {
    this.router.navigate(['/vote', poll.id]);
  }

}
