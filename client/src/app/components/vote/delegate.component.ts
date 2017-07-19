import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';


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
  pollID: String;

  constructor(
    private voteService: VoteService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
      this.route.params.subscribe(params => this.pollID = params['id']);
    }


  onSubmit(f: NgForm) {
    this.checkForUser(f.value.delegateemail);
  }

  setDelegate(): void {

  }

  checkForUser(userEmail: string): void {
    this.userService.getUsers().then(users => {
      let user = users.filter(user => user.email === userEmail);
      console.dir(user);
    });
  }

  setVote(pollID: string, vote:Vote): void {
    this.voteService.createVote(pollID, vote).then()
  }



}