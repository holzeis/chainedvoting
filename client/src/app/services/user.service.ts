import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Configuration} from '../app.constants';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { User } from '../models/user';

@Injectable()
export class UserService {

    public actionUrl: string;

    public constructor(private _http: Http, private _configuration: Configuration) {
        this.actionUrl = `${_configuration.host}register`;
    }

    public register(email: string): Observable<any> {
        return this._http.post(this.actionUrl, {email: email}).map((response: Response) => {
            return response;
        }); // .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getUser(userID: string): Promise<User> {
      const url = `api/users/${userID}`;
      return this._http.get(url).toPromise().then(res => res.json().data as User).catch(this.handleError);
    }

    getUsers(): Promise<User[]> {
      const url = `api/users/`;
      return this._http.get(url).toPromise().then(res => res.json().data as User[]).catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
    }
}
