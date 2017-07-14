import { Injectable } from '@angular/core';

import { POLLS } from '../mockdata/mock-polls';
import { Poll } from '../poll';

@Injectable()

export class PollService {

/*
  getPoll(pollID: number):Promise<Poll> {
    POLLS.find(poll => poll.id === pollID )
    return Promise.resolve(poll);
  }
*/
  getPolls(): Promise<Poll[]> {
    return Promise.resolve(POLLS);
  }
}