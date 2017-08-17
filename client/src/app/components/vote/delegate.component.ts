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

  users: User[];
  pollId: string;
  mockUserID = '1';

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
    this.checkForUser(f.value.delegateemail);
  }

  setDelegate(delegate: string): void {
    this.voteService.getVotes().then(votes => {
      const filteredVote = votes.filter(vote => String(vote.pollID) === this.pollId
      && String(vote.voter) === this.mockUserID);
      // TODO: implement direct vote route as user could have more than one vote (delegate)
      // filteredVote[0].delegate = delegate;

      this.voteService.updateVote(filteredVote[0]).then( () => {
        this.alertService.success('Delegate submited successfuly', true);
        this.goBack();
      }).catch(error => this.alertService.error(error));
    });
  }

  checkForUser(userEmail: string): void {
    this.userService.getUsers().then(users => {
      const filteredUsers = users.filter(user => user.email === userEmail);
      if (filteredUsers.length === 1) {
        this.setDelegate(filteredUsers[0].email);
      } else {
        this.alertService.error('User not found');
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
