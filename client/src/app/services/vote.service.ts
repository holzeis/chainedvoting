import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Configuration } from '../app.constants';

import { Vote } from '../models/vote';
import { User } from '../models/user';

@Injectable()
export class VoteService {

  private votesUrl = 'api/votes';
  private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: Http, private _configuration: Configuration) {
    this.votesUrl = `${_configuration.host}/api/votes`;
  }

  createVote(vote: Vote): Promise<Vote> {
    const url = this.votesUrl + '/create';
    return this.http.post(url, JSON.stringify(vote), {headers: this.headers})
        .toPromise().then(res => res.json() as Vote).catch(this.handleError);
  }

  getVotes(): Promise<Vote[]> {
    return this.http.get(this.votesUrl).toPromise()
        .then(response => response.json() as Vote[]).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
