import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PollComponent } from './components/poll/poll.component';
import { UserComponent } from './components/user/user.component';

import {Configuration} from './app.constants';
import {UserService} from './services/user.service';

const appRoutes: Routes = [
    { path: 'register', component: UserComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PollComponent,
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
    UserService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
