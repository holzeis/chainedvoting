import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router'


import { Poll } from '../../poll';
import { PollService } from '../../services/poll.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  polls: Poll[];
  selectedPoll: Poll;
  title = 'All polls';
  public constructor(private pollService: PollService, private router: Router){}

  ngOnInit() {
    this.getPolls();
  }
  getPolls():void {
    this.pollService.getPolls().then(polls => this.polls = polls);
  }

  selectPoll(pollID: string):void {
    this.router.navigate(['/poll', pollID]);
  }


  createPoll(): void {
    this.router.navigate(['/create']);
  }
}