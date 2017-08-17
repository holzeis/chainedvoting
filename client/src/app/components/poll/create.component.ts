import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { Poll, Option } from '../../models/poll';
import { Vote } from '../../models/vote';
import { User } from '../../models/user';

import { PollService } from '../../services/poll.service';
import { AlertService } from '../../services/alert.service';
import { VoteService } from '../../services/vote.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent {

  public poll: Poll;

  constructor(
    private pollService: PollService,
    private voteService: VoteService,
    private router: Router,
    private alertService: AlertService
  ) {}

  splitString(toSplit: string): Option[] {
    const options: Option[] = [];

    for (const opt  of toSplit.split(';')) {
      const option = new Option(opt);
      options.push(option);
    }

    return options;
  }

  public onSubmit(f: NgForm) {
    const currentUser: User = JSON.parse(localStorage.getItem('currentUser'));

    this.poll = new Poll();
    this.poll.name = f.value.name;
    this.poll.description = f.value.description;
    this.poll.owner = currentUser.email;
    this.poll.validFrom = f.value.validfrom;
    this.poll.validTo = f.value.validto;
    this.poll.options = this.splitString(f.value.options);

    this.pollService.createPoll(this.poll).then(res => {
      }).then(() => {
        this.alertService.success('Poll "' + this.poll.name + '" has been successfully created', true);
        this.router.navigate(['/dashboard']);
      }).catch(e => this.alertService.error(e));
  }
}
