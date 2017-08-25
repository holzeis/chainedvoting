import { ID } from "./id";

export class Poll extends ID {
  name: string;
  description: string;
  owner: string;
  validFrom: string;
  validTo: string;
  options: Option[];
}

export class Option extends ID {
  description: string;

  constructor(descr: string) {
    super();
    this.description = descr;
  }
}
