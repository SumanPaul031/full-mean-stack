import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  name: string;
  username: string;
  email: string;
  permission: string;
  id: string;
  isGuest: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  callerIsAdmin: boolean;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService, 
    private toastr: ToastrService, 
    private router: Router) { 
    this.activatedRoute.params.subscribe((params) => {
      this.id = params['id'];
    })
  }

  ngOnInit(): void {
    this.authService.getEditUser(this.id).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200){
        console.log(res);
        this.name = res.body.user.name;
        this.username = res.body.user.username;
        this.email = res.body.user.email;
        this.permission = res.body.user.permission;
        this.callerIsAdmin = res.body.caller.permission === 'admin' ? true : false;
        if(this.permission === 'user'){
          this.isGuest = true;
          this.isAdmin = false;
          this.isModerator = false;
        } else if(this.permission === 'admin'){
          this.isAdmin = true;
          this.isGuest = false;
          this.isModerator = false
        } else if(this.permission === 'moderator'){
          this.isModerator = true;
          this.isAdmin = false;
          this.isGuest = false;
        }
        // this.toastr.success('You have Logged In successfully', 'Success');
        // this.router.navigate(['/profile']);
      }
    }, 
    (error: HttpErrorResponse) => {
      this.toastr.error(error.error.message, 'Failure');
      // this.router.navigate(['/login']);
    });
  }

  updateName(){
    console.log(this.name);
    var name = this.name
    this.authService.EditUser(this.id, this.name, this.username, this.email, this.permission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

  updateUsername(){
    console.log(this.username);
    var username = this.username
    this.authService.EditUser(this.id, this.name, this.username, this.email, this.permission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

  updateEmail(){
    console.log(this.email);
    var email = this.email;
    this.authService.EditUser(this.id, this.name, this.username, this.email, this.permission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

  grantAdmin(){
    // console.log(this.permission);
    this.isAdmin = true;
    this.isModerator = false;
    this.isGuest = false;
    this.permission = 'admin';
    this.authService.EditUser(this.id, this.name, this.username, this.email, this.permission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

  grantModerator(){
    // console.log(this.permission);
    this.isModerator = true;
    this.isAdmin = false;
    this.isGuest = false;
    this.permission = 'moderator';
    this.authService.EditUser(this.id, this.name, this.username, this.email, this.permission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

  grantUser(){
    // console.log(this.permission)
    this.isGuest = true;
    this.isAdmin = false;
    this.isModerator = false;
    this.permission = 'user';
    this.authService.EditUser(this.id, this.name, this.username, this.email, this.permission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

}
