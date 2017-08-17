import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Poll } from '../../models/poll';
import { Vote } from '../../models/vote';
import { Transaction } from '../../models/transaction';

import { PollService } from '../../services/poll.service';
import { VoteService } from '../../services/vote.service';
import { AlertService } from '../../services/alert.service';
import { FabricService } from '../../services/fabric.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  polls: Poll[] = [];
  transactions: Transaction[] = [];

  public constructor(
    private pollService: PollService,
    private voteService: VoteService,
    private router: Router,
    private alertService: AlertService,
    private fabricService: FabricService
  ) {}

  ngOnInit() {
    this.retrievePolls();
    this.retrieveBlocks();
  }

  retrievePolls(): void {
    this.pollService.getPolls().then(polls => {
      console.log(JSON.stringify(polls));
      this.polls = polls;
    }).catch(error => this.alertService.error(error));
  }

  retrieveBlocks(): void {
    this.fabricService.queryBlocks().then(transactions => this.transactions = transactions).catch(error => this.alertService.error(error));
  }

  selectPoll(pollID: string): void {
    this.router.navigate(['/poll', pollID]);
  }

  createPoll(): void {
    this.router.navigate(['/create']);
  }
}
