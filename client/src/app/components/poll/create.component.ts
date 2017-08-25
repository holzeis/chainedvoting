import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { Poll, Option } from '../../models/poll';
import { Vote } from '../../models/vote';
import { User } from '../../models/user';

import { PollService } from '../../services/poll.service';
import { AlertService } from '../../services/alert.service';
import { VoteService } from '../../services/vote.service';

import { DatePickerComponent } from '../_utils/datepicker.component'; 

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent {

  @ViewChild(DatePickerComponent) datepicker: DatePickerComponent;

  public model: any = {};
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

  public createPoll() {
    const currentUser: User = JSON.parse(localStorage.getItem('currentUser'));

    this.poll = new Poll();
    this.poll.name = this.model.name;
    this.poll.description = this.model.description;
    this.poll.owner = currentUser.email;
    this.poll.validFrom = this.datepicker.validFrom;
    this.poll.validTo = this.datepicker.validTo;
    this.poll.options = this.splitString(this.model.options);

    this.pollService.createPoll(this.poll).then(res => {
      }).then(() => {
        this.alertService.success('Poll "' + this.poll.name + '" has been successfully created', true);
        this.router.navigate(['/dashboard']);
      }).catch(e => this.alertService.error(e));
  }
}
