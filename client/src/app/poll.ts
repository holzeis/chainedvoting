export class Poll {
  id: string;
  name: string;
  description: string;
  owner: string;
  validFrom: string;
  validTo: string;
  options: string[];
  votes: string[];
}