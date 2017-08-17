import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Poll } from '../models/poll';
import { Vote } from '../models/vote';

import { Configuration } from '../app.constants';
import { VoteService } from './vote.service';

@Injectable()
export class PollService {

  private pollsUrl: string;

  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http, private _configuration: Configuration, private voteService: VoteService) {
    this.pollsUrl = `${_configuration.host}/api/polls`;
  }

  public getPoll(pollID: string): Promise<Poll> {
    const url = this.pollsUrl + '/' + pollID;
    return this.http.get(url).toPromise().then(response => response.json() as Poll).catch(this.handleError);
  }

  // updatePoll(poll: Poll): Promise<Poll> {
  //   const url = `${this.pollsUrl}/${poll.id}`;
  //   return this.http.put(url, JSON.stringify(poll), {headers: this.headers})
  //   .toPromise().then(() => poll)
  //   .catch(this.handleError);
  // }

  public getPolls(): Promise<Poll[]> {
    return this.http.get(this.pollsUrl).toPromise().then(response => response.json() as Poll[]).catch(this.handleError);
  }

  public createPoll(poll: Poll, participants: any[]): Promise<Poll> {
    const url = this.pollsUrl + '/create';
    return this.http.post(url, JSON.stringify(poll), {headers: this.headers}).toPromise().catch(this.handleError);
  }

  deletePoll(pollID: any): Promise<void> {
    const url = `${this.pollsUrl}/${pollID}`;
    return this.http.delete(url, {headers: this.headers}).toPromise().then(() => null)
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
