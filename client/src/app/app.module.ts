import { MaterializeModule } from 'angular2-materialize';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PollComponent } from './components/poll/poll.component';
import { CreateComponent } from './components/poll/create.component';
import { UserComponent } from './components/user/user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VoteComponent } from './components/vote/vote.component';
import { DelegateComponent } from './components/vote/delegate.component';
import { AlertComponent } from './components/_utils/alert.component';
import { AutocompleteComponent } from './components/_utils/autocomplete.component';
import { LoginComponent } from './components/user/login.component';

import { Configuration } from './app.constants';
import { UserService } from './services/user.service';
import { PollService } from './services/poll.service';
import { VoteService } from './services/vote.service';
import { AlertService } from './services/alert.service';
import { FabricService } from './services/fabric.service';

import { AuthGuard } from './guards/auth.guard';

const appRoutes: Routes = [
  {
  path: '',
  redirectTo: '/dashboard',
  pathMatch: 'full'
  },
  { path: 'register', component: UserComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'poll/:id', component: PollComponent, canActivate: [AuthGuard] },
  { path: 'vote/:id', component: VoteComponent, canActivate: [AuthGuard] },
  { path: 'delegate/:id', component: DelegateComponent, canActivate: [AuthGuard]},
  { path: 'create', component: CreateComponent, canActivate: [AuthGuard] }
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
    AlertComponent,
    AutocompleteComponent,
    LoginComponent
  ],
  imports: [
    MaterializeModule,
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
    AlertService,
    UserService,
    PollService,
    VoteService,
    FabricService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
