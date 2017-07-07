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
    this._userService.register(email).subscribe( result => {
      console.log(result);
      this.success = result.success;
      this.response = result.response;
    });
  }

}
