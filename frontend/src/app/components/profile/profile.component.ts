import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  isUserLoggedIn: boolean;
  val: boolean;
  username;
  email;
  name;
  id;
  isAdmin: boolean;
  isModerator: boolean;
  isGuest: boolean;

  formname = new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)+(?!\S)')]);
  formusername = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.pattern('^[a-zA-Z0-9]+$')]);
  formemail = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.email]);

  editid: string;
  editname: string;
  editemail: string;
  editpermission: string;
  editusername: string;

  subscription: Subscription;

  constructor(
    private dataSharingService: DataSharingService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef) { 
    this.dataSharingService.isUserLoggedIn.subscribe( value => {
      this.isUserLoggedIn = value;
    });

    this.dataSharingService.User.subscribe( value => {
      this.username = value;
    });

    this.dataSharingService.Admin.subscribe( value => {
      this.isAdmin = value;
    });

    this.dataSharingService.Moderator.subscribe( value => {
      this.isModerator = value;
    });

    this.dataSharingService.Guest.subscribe( value => {
      this.isGuest = value;
    });
  }

  ngOnInit(): void {
    this.val = localStorage.getItem('x-access-token') ? true : false;

    if(this.val){
      this.subscription = this.authService.getUser().subscribe((res: HttpResponse<any>) => {
        if(res.status === 200){
          // console.log(res.body);
          this.isGuest = res.body.permission === 'user' ? true : false;
          if(!this.isGuest){
            this.isAdmin = res.body.permission === 'admin' ? true : false;
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
          
          this.name = res.body.name;
          this.username = res.body.username;
          this.email = res.body.email;
          this.id = res.body._id;
          this.dataSharingService.isUserLoggedIn.next(true);
          this.dataSharingService.User.next(this.username);
        }
      }, 
      (error: HttpErrorResponse) => {
        // console.log(error.error);
        this.authService.logout()
        this.dataSharingService.isUserLoggedIn.next(false);
        this.dataSharingService.User.next('');
      })
    } else{
      this.dataSharingService.isUserLoggedIn.next(false);
      this.dataSharingService.User.next('');
    }
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe();
  }

  onEditClick(){
    this.authService.getEditUser(this.id).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200){
        console.log(res);
        this.editid = res.body.user._id;
        this.editname = res.body.user.name;
        this.editusername = res.body.user.username;
        this.editemail = res.body.user.email;
        this.editpermission = res.body.user.permission;
      }
    }, 
    (error: HttpErrorResponse) => {
      this.toastr.error(error.error.message, 'Failure');
      // this.router.navigate(['/login']);
    });
  }

  onUpdateClick(){
    // console.log(this.editname);
    this.authService.EditUser(this.editid, this.editname, this.editusername, this.editemail, this.editpermission).subscribe((res: HttpResponse<any>) => {
      this.toastr.success(res.body.message, 'Success');
      this.name = this.editname;
      this.username = this.editusername;
      this.email = this.editemail;
      this.cdRef.detectChanges();
      this.dataSharingService.User.next(this.username);
      // this.authService.getUser().subscribe((res: HttpResponse<any>) => {
      //   if(res.status === 200){
      //     this.name = res.body.name;
      //     this.username = res.body.username;
      //     this.email = res.body.email;
      //     this.id = res.body._id;
      //     this.dataSharingService.isUserLoggedIn.next(true);
      //     this.dataSharingService.User.next(res.body.username);
      //   }
      // }, 
      // (error: HttpErrorResponse) => {
      //   // console.log(error.error);
      //   this.authService.logout()
      //   this.dataSharingService.isUserLoggedIn.next(false);
      //   this.dataSharingService.User.next('');
      // })
    },
    (err: HttpErrorResponse) => {
      this.toastr.error(err.error.message, 'Failure');
    })
  }

  nameErrorMessage(){
    if (this.formname.hasError('required')) {
      return 'You must enter a name';
    } else if(this.formname.hasError('pattern')){
      return 'Enter your FULL Name. No numbers allowed';
    } else if(this.formname.hasError('minlength')){
      return 'Name should be atleast 3 characters long'
    } else {
      return '';
    }
  }

  usernameErrorMessage(){
    if (this.formusername.hasError('required')) {
      return 'You must enter a username';
    } else if(this.formusername.hasError('pattern')){
      return 'Username should contain only alphabets and numbers. No special characters or spaces';
    } else if(this.formusername.hasError('minlength')){
      return 'Username should be atleast 3 characters long'
    } else if(this.formusername.hasError('maxlength')){
      return 'Username should not be more than 25 characters long'
    } else {
      return '';
    }
  }

  emailErrorMessage(){
    if (this.formemail.hasError('required')) {
      return 'You must enter an email';
    } else if(this.formemail.hasError('email')){
      return 'Please enter a valid email';
    } else if(this.formemail.hasError('minlength')){
      return 'Email should be atleast 3 characters long'
    } else if(this.formemail.hasError('maxlength')){
      return 'Email should not be more than 25 characters long'
    } else {
      return '';
    }
  }

}
