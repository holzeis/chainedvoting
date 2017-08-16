import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Configuration} from '../app.constants';

import { User } from '../models/user';
import { Transaction } from '../models/transaction';

@Injectable()
export class FabricService {

    private fabricUrl: string;

    private headers = new Headers({'Content-Type': 'application/json'});

    public constructor(private _http: Http, private _configuration: Configuration) {
        this.fabricUrl = `${_configuration.host}/api/fabric`;
    }

    queryBlocks(): Promise<Transaction[]> {
      const url = this.fabricUrl + '/blocks';
      return this._http.get(url).toPromise().then(res => res.json() as Transaction[]).catch(this.handleError);
    }
    
    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
    }
}
