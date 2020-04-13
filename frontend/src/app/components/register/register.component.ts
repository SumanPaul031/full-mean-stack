import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ValidateService } from 'src/app/services/validate.service';
import { FormGroup, FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form;

  username: string;
  email: string;
  password: string;
  name: string;

  formname = new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)+(?!\S)')]);
  formusername = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.pattern('^[a-zA-Z0-9]+$')]);
  formemail = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.email]);
  formpassword = new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,}$')]);

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private validateService: ValidateService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
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

  passwordErrorMessage(){
    if (this.formpassword.hasError('required')) {
      return 'You must enter a password';
    } else if(this.formpassword.hasError('pattern')){
      return 'Password must contain \natleast one lowercase letter, \none uppercase letter, \none digit and \none special character (No Spaces)';
    } else if(this.formpassword.hasError('minlength')){
      return 'Password should be atleast 8 characters long'
    } else {
      return '';
    }    
  }

  onRegisterSubmit(){
    const user = {
      username: this.username,
      email: this.email,
      password: this.password,
      name: this.name
    }
    // console.log('Form Submitted');

    if(!this.validateService.validateRegister(user)){
      this.toastr.error('Please fill in all fields', 'Error', {
        timeOut: 3000,
        progressBar: true
      });
      return false;
    }

    if(!this.validateService.validateEmail(user.email)){
      this.toastr.error('Please fill in a valid email address', 'Error');
      return false;
    }

    //Register User
    this.authService.register(user.username, user.email, user.password, user.name).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200){
        this.toastr.success(res.body.message, 'Success');
        this.router.navigate(['/login']);
      }
    }, 
    (error: HttpErrorResponse) => {
      // let errorPayload = JSON.parse(error.message);
      // console.log(error.error.message);
      this.toastr.error(error.error.message, 'Failure');
      this.router.navigate(['/register']);
    });
  }

}
