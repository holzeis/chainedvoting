import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Configuration} from '../app.constants';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserService {

    public actionUrl : string;

    public constructor(private _http: Http, private _configuration: Configuration) {
        this.actionUrl = `${_configuration.host}register`;
    }

    public register(email : string) : Observable<any> {
        return this._http.post(this.actionUrl, {email: email}).map((response: Response) => {
            if (!response || !response.json || !response.json()) {
                return false;
            }

            return true;
        }).catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    } 
}