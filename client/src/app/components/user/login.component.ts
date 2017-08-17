import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public model: any = {};
  public loading = false;
  public returnUrl: string;

  constructor(private userService: UserService,  private alertService: AlertService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // reset login status
    this.userService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  public login() {
    this.loading = true;
    this.userService.login(this.model.email).then(res => this.router.navigate([this.returnUrl]))
      .catch(error => {
        this.loading = false
        this.alertService.error(error)
      });
  }
}
