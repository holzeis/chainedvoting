import { Injectable } from '@angular/core';

import { POLLS } from '../mockdata/mock-polls';
import { Poll } from '../poll';

@Injectable()

export class PollService {
  getPolls(): Promise<Poll[]> {
    return Promise.resolve(POLLS);
  }
}