import { Injectable } from '@angular/core';

import { VOTE } from '../mockdata/mock-vote';
import { Vote } from '../vote';

@Injectable()

export class VoteService {
  vote: Vote = VOTE;

  setVote(pollID: string):Promise<Vote> {

    return Promise.resolve(VOTE);
  }
}