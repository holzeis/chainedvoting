export class Poll {
  id: number;
  name: string;
  description: string;
  owner: number;
  validFrom: number;
  validTo: number;
  options: string[];
}
