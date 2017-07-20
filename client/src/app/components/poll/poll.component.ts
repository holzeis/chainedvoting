import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { Poll } from '../../poll';
import { PollStat } from '../../pollstat';
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
  votes: Vote[];
  pollID: string;
  pollStats: PollStat[] = [];

  public constructor(private voteService: VoteService, private router: Router, private route: ActivatedRoute,
    private pollService: PollService, private userService: UserService) {
      this.route.params.subscribe(params => this.pollID = params['id']);


  }

  ngOnInit(){
    this.getPoll(this.pollID);
  }

  getPoll(pollID: string): void {
    this.pollService.getPoll(pollID).then(poll => {
      this.poll = poll;
      this.voteService.getVotes().then(votes => {
        votes = votes.filter(vote => vote.pollID == this.pollID && vote.option);
          for (let option of poll.options) {
            this.pollStats.push({option: option, count: 0});
          }

          for(let pollStat of this.pollStats) {
              for (let vote of votes) {
                if (vote.option === pollStat.option) {
                  pollStat.count++;
                }
              } 
          }
          console.dir(this.pollStats);
      });

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
