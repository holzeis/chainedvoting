import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PollComponent } from './components/poll/poll.component';
import { PollsComponent } from './components/polls/polls.component';
import { UserComponent } from './components/user/user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'

import {Configuration} from './app.constants';
import {UserService} from './services/user.service';
import { PollService } from './services/poll.service';

const appRoutes: Routes = [
    { path: 'register', component: UserComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'viewpolls', component: PollsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PollComponent,
    PollsComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [
    Configuration,
    UserService,
    PollService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
