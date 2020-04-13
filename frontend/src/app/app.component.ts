import { Component, OnInit } from '@angular/core';
import { AuthService, FacebookLoginProvider, SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'MEAN Full App';
  user: SocialUser;
  loggedIn: boolean;
  authToken: string;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
  }

}
