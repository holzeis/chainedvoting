import {Vote} from './vote';
import {User} from './user'

export class Poll {
  id: string;
  name: string;
  description: string;
  owner: User;
  validFrom: string;
  validTo: string;
  options: string[];
  votes: Vote[];
}