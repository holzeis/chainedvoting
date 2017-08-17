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

    public login(email: string): Promise<void> {

        const user: User = {
            email: 'richard.holzeis@at.ibm.com',
            surname: 'Richard',
            lastname: 'Holzeis'
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        return Promise.resolve();

        // const url = this.userUrl + '/login'
        // return this._http.post(url, JSON.stringify({ email: email }), {headers: this.headers}).toPromise().then(user => {
        //     localStorage.setItem('currentUser', JSON.stringify(user));
        // }).catch(this.handleError);
    }

    public logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
    }
}
