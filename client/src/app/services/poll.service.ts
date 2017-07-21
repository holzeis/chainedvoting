import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Poll } from '../models/poll';
import { Vote } from '../models/vote';

import {VoteService} from './vote.service';



@Injectable()

export class PollService {

  private pollsUrl = 'api/polls';
  private headers = new Headers({'Content-Type': 'application/json'});
  constructor(private http: Http, private voteService: VoteService) {}


  getPoll(pollID: string): Promise<Poll> {
    const url = `${this.pollsUrl}/${pollID}`;
    return this.http.get(url).toPromise()
    .then(response => response.json().data as Poll).catch(this.handleError);
  }

  updatePoll(poll: Poll): Promise<Poll> {
    const url = `${this.pollsUrl}/${poll.id}`;
    return this.http.put(url, JSON.stringify(poll), {headers: this.headers})
    .toPromise().then(() => poll)
    .catch(this.handleError);
  }

  getPolls(): Promise<Poll[]> {
    return this.http.get(this.pollsUrl).toPromise()
    .then(response => response.json().data as Poll[]).catch(this.handleError);
  }

  createPoll(poll: Poll, participants: string[]): Promise<Poll> {
    return this.http.post(this.pollsUrl, JSON.stringify(poll), {headers: this.headers})
    .toPromise().then(res => {
      res.json().data as Poll;
      let pollId = res.json().data.id;
      for (let participant of participants) {
        this.voteService.createVote({
          id: null,
          pollID: pollId,
          voter: participant,
          option: null,
          delegate: null,
          timestamp: null
        });
      }
    })
    .catch(this.handleError);
  }

  deletePoll(pollID: string): Promise<void> {
    const url = `${this.pollsUrl}/${pollID}`;
    return this.http.delete(url, {headers: this.headers}).toPromise().then(() => null)
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
