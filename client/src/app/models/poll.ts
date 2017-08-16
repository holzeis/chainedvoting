export class Poll {
  id: number;
  name: string;
  description: string;
  owner: number;
  validFrom: number;
  validTo: number;
  options: Option[];
}

export class Option {

  id: number;
  description: string;

  constructor(descr: string) {
    this.description = descr;
  }
}
