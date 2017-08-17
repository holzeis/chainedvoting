import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';

import { AlertService } from './services/alert.service';
import { UserService } from './services/user.service';


import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Chained Voting';
  currentUser: User;

  constructor(private userService: UserService, private alertService: AlertService,
      private router: Router, private route: ActivatedRoute) {

    this.userService.signedIn.subscribe(signedIn => {
      if (signedIn) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      } else {
        this.currentUser = null;
      }
    });

  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  public logout() {
    console.log('clicked logout!');
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
