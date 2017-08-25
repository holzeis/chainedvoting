import { ID } from './id';
import { Vote } from './vote';

export class Poll extends ID {
  name: string;
  description: string;
  owner: string;
  validFrom: string;
  validTo: string;
  options: Option[];
  votes: Vote[];
}

export class Option extends ID {
  description: string;

  constructor(descr: string) {
    super();
    this.description = descr;
  }
}
