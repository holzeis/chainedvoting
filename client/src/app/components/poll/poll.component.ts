import { Component, OnInit, Input } from '@angular/core';

import { Poll } from '../../poll';
import { PollService } from '../../services/poll.service'

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {

  poll: Poll;
  ngOnInit(){}

}
