import {Vote} from './vote';
import {User} from './user';

export class Poll {
  id: any;
  name: string;
  description: string;
  owner: any;
  validFrom: string;
  validTo: string;
  options: string[];
}