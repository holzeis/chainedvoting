import { ID } from './id';
import { Option } from './poll';

export class Vote extends ID {
  pollID: string;
  voter: string;
  option: Option;
  delegate: string;
  timestamp: Date;
}
