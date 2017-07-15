import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { POLLS } from '../mockdata/mock-polls';
import { Poll } from '../poll';
import { Vote } from '../vote';


@Injectable()

export class PollService {

  private pollsUrl = 'api/polls';
  private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: Http) {}


  getPoll(pollID: string):Promise<Poll> {
    const url = `${this.pollsUrl}/${pollID}`;
    return this.http.get(url).toPromise()
    .then(response => response.json().data as Poll).catch(this.handleError);;
  }

  updatePoll(poll: Poll, pollID:string): Promise<Poll> {
    const url = `${this.pollsUrl}/${pollID}`;
    return this.http.put(url, JSON.stringify(poll), {headers: this.headers})
    .toPromise().then(() => poll)
    .catch(this.handleError);
  }

  getPolls(): Promise<Poll[]> {
    return this.http.get(this.pollsUrl).toPromise()
    .then(response => response.json().data as Poll[]).catch(this.handleError);;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}