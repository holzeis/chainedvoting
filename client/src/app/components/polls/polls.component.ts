import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import { Poll } from '../../poll';
import { PollService } from '../../services/poll.service';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.css']
})

export class PollsComponent implements OnInit{
  polls: Poll[];
  title = 'All polls';
  public constructor(private pollService: PollService){}

  ngOnInit() {
    this.getPolls();
  }
  getPolls():void{
    this.pollService.getPolls().then(polls => this.polls = polls);
  }


}
