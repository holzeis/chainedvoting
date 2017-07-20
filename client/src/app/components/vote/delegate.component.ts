import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';


import {Vote} from '../../vote';
import {VoteService} from '../../services/vote.service';

import {User} from '../../user';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.css']
})

export class DelegateComponent {

  vote: Vote;
  users: User[];
  pollId: String;
  mockUserID = 1;

  constructor(
    private voteService: VoteService,
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location
  ) {
      this.route.params.subscribe(params => this.pollId = params['id']);
    }


  onSubmit(f: NgForm) {
    this.checkForUser(f.value.delegateemail);
  }

  setDelegate(delegate:any): void {
    this.voteService.getVotes().then(votes => {
      let vote = votes.filter(vote => vote.pollID == this.pollId && vote.voter == this.mockUserID);
      //TODO: implement direct vote route as user could have more than one vote (delegate)
      vote[0].delegate = delegate;

      this.voteService.updateVote(vote[0].id, vote[0]).then(()=> this.goBack());
    });
  }

  checkForUser(userEmail: string): void {
    this.userService.getUsers().then(users => {
      let user = users.filter(user => user.email === userEmail);
      console.dir(user);
      if(user.length == 1) {
        this.setDelegate(user[0].id);
      }
    });
  }

  goBack() {
    this.location.back();
  }



}