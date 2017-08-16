import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  public email: string;

  constructor(private userService: UserService, private alertService: AlertService, private router: Router) { }

  ngOnInit() {
  }

  public register(email: string) {
    console.log('registering ' + email);
    this.userService.register(email).then(() => {
        this.alertService.success('User with email: ' + email + ' has been successfully registered.', true);
        this.router.navigate(['/dashboard']);
      }).catch(e => this.alertService.error(e));
  }

}
