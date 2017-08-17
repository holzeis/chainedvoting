import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Configuration} from '../app.constants';

import { User } from '../models/user';

@Injectable()
export class UserService {

    private userUrl: string;

    private headers = new Headers({'Content-Type': 'application/json'});

    public constructor(private _http: Http, private _configuration: Configuration) {
        this.userUrl = `${_configuration.host}/api/users`;
    }

    public register(user: User): Promise<void> {
        const url = this.userUrl + '/register';
        return this._http.post(url, JSON.stringify(user), {headers: this.headers}).toPromise().catch(this.handleError);
    }

    getUser(userID: string): Promise<User> {
      const url = this.userUrl + '/' + userID;
      return this._http.get(url).toPromise().then(res => res.json().data as User).catch(this.handleError);
    }

    getUsers(): Promise<User[]> {
      return this._http.get(this.userUrl).toPromise().then(res => res.json().data as User[]).catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
    }
}
