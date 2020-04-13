import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ValidateService } from 'src/app/services/validate.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { error } from 'protractor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  expired: boolean = false;
  disable: boolean = false;
  incusername: boolean = false;
  incpassword: boolean = false;
  socialLogin: boolean = false;
  isAdmin: boolean;
  isGuest: boolean;
  isModerator: boolean;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private validateService: ValidateService,
    private dataSharingService: DataSharingService) { }

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('error');
    if(myParam == "Account_not_Activated") {
      this.toastr.error('Please activate your account before logging in with social media with the same email', 'Failure');
      this.expired = true;
      this.disable = true;
    }
  }

  onLoginSubmit(){
    const user = {
      username: this.username,
      password: this.password,
    }

    // console.log('Login form submitted');

    if(!this.validateService.validateLogin(user)){
      this.toastr.error('Please fill in all fields', 'Error', {
        timeOut: 1000,
        progressBar: true
      });
      this.dataSharingService.isUserLoggedIn.next(false);
      return false;
    }

    //Authenticate User
    this.authService.login(user.username, user.password).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200){
        this.isGuest = res.body.user.permission === 'user' ? true : false;
          if(!this.isGuest){
            this.isAdmin = res.body.user.permission === 'admin' ? true : false;
            if(!this.isAdmin){
              this.isModerator = true;
              this.dataSharingService.Moderator.next(true);
              this.dataSharingService.Admin.next(false);
              this.dataSharingService.Guest.next(false);
            }
            else{
              this.dataSharingService.Moderator.next(false);
              this.dataSharingService.Admin.next(true);
              this.dataSharingService.Guest.next(false);
            }
          } else{
            this.dataSharingService.Moderator.next(false);
            this.dataSharingService.Admin.next(false);
            this.dataSharingService.Guest.next(true);
          }
        this.toastr.success('You have Logged In successfully', 'Success');
        this.router.navigate(['/profile']);
        this.dataSharingService.isUserLoggedIn.next(true);
        this.dataSharingService.User.next(user.username);
      }
    }, 
    (error: HttpErrorResponse) => {
      // let errorPayload = JSON.parse(error.message);
      // console.log(error.error);
      if(error.error.expired){
        this.expired = true;
        this.disable = true;
        this.incusername = false;
        this.incpassword = false;
        this.socialLogin = false;
      } else if(error.error.message === 'Username not found'){
        this.incusername = true;
        this.incpassword = false;
        this.socialLogin = false;
      } else if(error.error.message === 'Incorrect Password'){
        this.incpassword = true;
        this.incusername = false;
        this.socialLogin = false;
      } else if(error.error.message === 'Password does not exist for this username. You used one of the social logins to create an account'){
        this.incpassword = false;
        this.incusername = false;
        this.socialLogin = true;
      }
      this.toastr.error(error.error.message, 'Failure');
      this.router.navigate(['/login']);
      this.dataSharingService.isUserLoggedIn.next(false);
    });
  }

  fbLogin(){
    // console.log(window.location.host);
    // console.log(window.location.protocol);
    window.location.href = window.location.protocol + '//' + window.location.host + '/auth/facebook';
  }

  twLogin(){
    // console.log(window.location.host);
    // console.log(window.location.protocol);
    window.location.href = window.location.protocol + '//' + window.location.host + '/auth/twitter';
  }

  gLogin(){
    window.location.href = window.location.protocol + '//' + window.location.host + '/auth/google';
  }

  onResendClick(){
    this.router.navigate(['/resend']);
  }

  onUsernameClick(){
    this.router.navigate(['/resetusername']);
  }

  onPasswordClick(){
    this.router.navigate(['/resetpassword']);
  }

}
