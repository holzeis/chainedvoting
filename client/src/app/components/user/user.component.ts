import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

import { User } from '../../models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  public user: User;

  constructor(private userService: UserService, private alertService: AlertService, private router: Router) { }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    this.user = {
      email: f.value.email,
      surname: f.value.surname,
      lastname: f.value.lastname
    };
    this.userService.register(this.user).then(res => {
      }).then(() => {
        this.alertService.success('User with email: ' + this.user.email + ' has been successfully registered.', true);
        this.router.navigate(['/login']);
      }).catch(e => this.alertService.error(e));
  }

}
