import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';

import { AppComponent } from './app.component';
import { PollComponent } from './components/poll/poll.component';
import { CreateComponent } from './components/poll/create.component';
import { UserComponent } from './components/user/user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VoteComponent } from './components/vote/vote.component';
import { DelegateComponent } from './components/vote/delegate.component';
import { AlertComponent } from './components/_utils/alert.component';

import { Configuration } from './app.constants';
import { UserService } from './services/user.service';
import { PollService } from './services/poll.service';
import { VoteService } from './services/vote.service';
import { AlertService } from './services/alert.service';

const appRoutes: Routes = [
  {
  path: '',
  redirectTo: '/dashboard',
  pathMatch: 'full'
  },
  { path: 'register', component: UserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'poll/:id', component: PollComponent },
  { path: 'vote/:id', component: VoteComponent },
  { path: 'delegate/:id', component: DelegateComponent},
  { path: 'create', component: CreateComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PollComponent,
    VoteComponent,
    DelegateComponent,
    CreateComponent,
    UserComponent,
    AlertComponent
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
    AlertService,
    UserService,
    PollService,
    VoteService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
