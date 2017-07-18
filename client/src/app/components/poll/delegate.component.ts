import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';

import {Vote} from '../../vote';
import {VoteService} from '../../services/vote.service';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.css']
})

export class DelegateComponent implements OnInit{

  votes: Vote[];

  constructor(private voteService: VoteService) {

  }

  ngOnInit(){
    this.getVotes();
  }

  onSubmit(f: NgForm) {
    
  }

  setDelegate(): void {

  }

  getVotes(): void {
    this.voteService.getVotes().then(votes => {
      this.votes = votes;
      console.log('Here are your votes: ');
      console.dir(this.votes);
    });

  }



}