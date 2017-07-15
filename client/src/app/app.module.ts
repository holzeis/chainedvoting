import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent } from './app.component';
import { PollComponent } from './components/poll/poll.component';
import { CreateComponent } from './components/poll/create.component';
import { UserComponent } from './components/user/user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'

import {Configuration} from './app.constants';
import {UserService} from './services/user.service';
import { PollService } from './services/poll.service';
import { VoteService } from './services/vote.service';

const appRoutes: Routes = [
    { path: 'register', component: UserComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'poll/:id', component: PollComponent },
    { path: 'create', component: CreateComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PollComponent,
    CreateComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [
    Configuration,
    UserService,
    PollService,
    VoteService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
