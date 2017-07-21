import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { Vote } from '../models/vote';
import { User } from '../models/user';

@Injectable()

export class VoteService {

  private votesUrl = 'api/votes';
  private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: Http) {}

  deleteVote(voteId: any): Promise<any> {
    const url = `${this.votesUrl}/${voteId}`;
    return this.http.delete(url, {headers: this.headers}).toPromise()
    .then(() => null).catch(this.handleError);
  }

  createVote(vote: Vote): Promise<Vote> {
    return this.http.post(this.votesUrl, JSON.stringify(vote), {headers: this.headers})
    .toPromise().then(res => res.json().data as Vote).catch(this.handleError);
  }

  updateVote(voteID: string, vote: Vote): Promise<Vote> {
    const url = `${this.votesUrl}/${voteID}`;
    return this.http.put(url, JSON.stringify(vote), {headers: this.headers})
    .toPromise().then(() => vote)
    .catch(this.handleError);
      // TODO: implement
  }

  getVotes(): Promise<Vote[]> {
    return this.http.get(this.votesUrl).toPromise()
    .then(response => response.json().data as Vote[]).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
