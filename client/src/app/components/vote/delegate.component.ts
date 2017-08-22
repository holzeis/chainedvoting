import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {Vote} from '../../models/vote';
import {User} from '../../models/user';

import {VoteService} from '../../services/vote.service';
import {UserService} from '../../services/user.service';
import {AlertService} from '../../services/alert.service';

import {AutocompleteComponent} from '../_utils/autocomplete.component';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.css']
})
export class DelegateComponent {
  public users: User[];
  public pollID: string;

  @ViewChild(AutocompleteComponent) autocmp: AutocompleteComponent;

  constructor(
    private voteService: VoteService,
    private route: ActivatedRoute,
    private userService: UserService,
    private alertService: AlertService,
    private location: Location
  ) {
      this.route.params.subscribe(params => this.pollID = params['id']);
  }

  onSubmit(f: NgForm) {
    console.log('delegated to ' + this.autocmp.query);

    const user: User = JSON.parse(localStorage.getItem('currentUser'));
    const vote = new Vote();
    vote.pollID = this.pollID;
    vote.timestamp = new Date();
    vote.voter = user.email;
    vote.delegate = this.autocmp.query;

    this.voteService.delegate(vote).then(res => {
      this.alertService.success('Your vote has been successfully delegated to ' + this.autocmp.query + '!');
    }).catch(error => this.alertService.error(error));
  }
}
