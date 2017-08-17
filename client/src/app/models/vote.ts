import { ID } from './id';

export class Vote extends ID {
  pollID: string;
  voter: string;
  option: string;
  delegate: string;
  timestamp: Date;
}
