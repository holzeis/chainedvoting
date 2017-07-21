import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Poll} from '../../models/poll';
import {Vote} from '../../models/vote';

import {PollService} from '../../services/poll.service';
import {VoteService} from '../../services/vote.service';
import {AlertService} from '../../services/alert.service';

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
    private route: ActivatedRoute,
    private location: Location,
    private alertService: AlertService
  ) {
    this.route.params.subscribe(params => this.pollID = params['id']);
  }

  ngOnInit() {

    this.getPoll(this.pollID);

  }

  getPoll(pollID: string): void {
    this.pollService.getPoll(pollID).then(poll => {
      this.poll = poll;
    });
  }

  setVote(option: string): void {
    this.voteService.getVotes().then(votes => {
      let filteredVote = votes.filter(vote => vote.pollID == this.poll.id
        && (vote.delegate == this.mockUserID || vote.voter == this.mockUserID) && !vote.timestamp);
      console.dir(filteredVote);
      // TODO: implement direct vote route as user could have more than one vote (delegate)
      filteredVote[0].option = option;
      filteredVote[0].timestamp = new Date().getTime();

      this.voteService.updateVote(filteredVote[0].id, filteredVote[0]).then( () => {
        this.alertService.success('Vote successfuly submited', true);
        this.goBack();
      }).catch(error => {
        this.alertService.error(error);
      });
    });
  }

  goBack(): void {
    this.location.back();
  }
}
