import {User} from './user';

export class Vote {
  id: string;
  voter: User;
  description: string;
  option: string;
  delegate: User;
  timestamp: number;
}