import { ID } from './id';

export class Poll extends ID {
  name: string;
  description: string;
  owner: string;
  validFrom: number;
  validTo: number;
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

export class Vote extends ID {
  timestamp: number;
  option: Option;
  voter: string;
  delegatedVoter: string;

  constructor(timestamp: number, option: Option, voter: string, delegatedVoter: string) {
    super();
    this.timestamp = timestamp;
    this.option = option;
    this.voter = voter;
    this.delegatedVoter = delegatedVoter;
  }
}