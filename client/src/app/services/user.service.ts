import {Injectable, Output, EventEmitter} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Configuration} from '../app.constants';

import { User } from '../models/user';

@Injectable()
export class UserService {

    @Output() signedIn: EventEmitter<any> = new EventEmitter();

    private userUrl: string;

    private headers = new Headers({'Content-Type': 'application/json'});

    public constructor(private _http: Http, private _configuration: Configuration) {
        this.userUrl = `${_configuration.host}/api/users`;
    }

    public register(user: User): Promise<void> {
        const url = this.userUrl + '/register';
        return this._http.post(url, JSON.stringify(user), {headers: this.headers}).toPromise().catch(this.handleError);
    }

    public login(email: string): Promise<void> {
        const url = this.userUrl + '/login/' + email;
        return this._http.get(url, {headers: this.headers}).toPromise().then(response => {

            localStorage.setItem('currentUser', response.text());

            // populate an event that the user has been signed in.
            this.signedIn.emit(true);
        }).catch(this.handleError);
    }

    public logout() {
        // populate event that the user has been logged out.
        this.signedIn.emit(false);
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }

    public getAllUsers(): Promise<User[]> {
        return this._http.get(this.userUrl, {headers: this.headers}).toPromise().then(response => response.json() as User[]).catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.json().message || error);
    }
}
