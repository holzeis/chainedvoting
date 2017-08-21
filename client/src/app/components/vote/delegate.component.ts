import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Vote} from '../../models/vote';
import {User} from '../../models/user';

import {VoteService} from '../../services/vote.service';
import {UserService} from '../../services/user.service';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.css']
})

export class DelegateComponent {
  public users: User[];
  public pollId: string;

  constructor(
    private voteService: VoteService,
    private route: ActivatedRoute,
    private userService: UserService,
    private alertService: AlertService,
    private location: Location
  ) {
      this.route.params.subscribe(params => this.pollId = params['id']);
  }

  onSubmit(f: NgForm) {
    console.log(f);
  }

  delegate(delegate: string): void {
    // this.voteService.getVotes().then(votes => {
    //   const filteredVote = votes.filter(vote => String(vote.pollID) === this.pollId
    //   && String(vote.voter) === this.mockUserID);
    //   // TODO: implement direct vote route as user could have more than one vote (delegate)
    //   filteredVote[0].delegate = delegate;

    //   this.voteService.updateVote(filteredVote[0]).then( () => {
    //     this.alertService.success('Delegate submited successfuly', true);
    //     this.goBack();
    //   }).catch(error => this.alertService.error(error));
    // });
  }

  goBack() {
    this.location.back();
  }
}
