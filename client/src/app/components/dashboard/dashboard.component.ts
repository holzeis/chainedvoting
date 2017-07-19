import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router'


import { Poll } from '../../poll';
import { PollService } from '../../services/poll.service';
import { User } from '../../user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  title = 'Polls';
  ownPolls: Poll[];
  polls: Poll[];
  delegates: Poll[];
  user: User;

  // mock user
  mockUserID = '1';

  public constructor(
    private pollService: PollService,
    private userService: UserService,
    private router: Router,
  ){}

  ngOnInit() {
    this.getPolls();

  }
  getPolls():void {
    this.pollService.getPolls().then(polls => {
        this.ownPolls = polls.filter(poll => poll.owner === this.mockUserID);
        this.userService.getUser(this.mockUserID).then(user => {
          this.user = user;
          this.polls = [];
          for (let userPoll of user.polls) {
            for (let poll of polls) {
              if (userPoll === poll.id) {
                this.polls.push(poll);
              }
            }
          }
        });
      });
  }

  selectPoll(pollID: string):void {
    this.router.navigate(['/poll', pollID]);
  }

  createPoll(): void {
    this.router.navigate(['/create']);
  }

  deletePoll(poll: Poll): void {
    this.pollService.deletePoll(poll.id).then(() => {
      this.ownPolls = this.ownPolls.filter(p => poll !== p);
    });
  }
}