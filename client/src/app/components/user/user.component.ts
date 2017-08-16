import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  public email: string;

  public success: boolean;
  public response: string;

  constructor(private _userService: UserService) { }

  ngOnInit() {
  }

  public register(email: string) {
    console.log('registering ' + email);
    this._userService.register(email).then(response => {
      console.log(response);
    });
  }

}
