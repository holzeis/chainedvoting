import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';

import { AlertService } from './services/alert.service';


import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Chained Voting';
  currentUser: User;

  constructor(private alertService: AlertService, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  public logout() {
    console.log("clicked logout!");
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    //this.router.navigate(['/'])
  }
}
