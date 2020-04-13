import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-newpassword',
  templateUrl: './newpassword.component.html',
  styleUrls: ['./newpassword.component.css']
})
export class NewpasswordComponent implements OnInit {

  password: string;
  token: string;
  email: string;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService) { 
      this.activatedRoute.params.subscribe((params) => {
        this.token = params['token'];
      })
    }

  ngOnInit(): void {
    // console.log(this.token);
    this.authService.resetPassword(this.token).subscribe((res: HttpResponse<any>) => {
      // console.log(res);
      if(res.status === 200){
        // this.router.navigate(['/login']);
        this.toastr.success('Please enter a new password', 'Success');
        this.email = res.body.user.email;
      }
    }, 
    (err: HttpErrorResponse) => {
      // console.log(err);
      this.router.navigate(['/login']);
      this.toastr.error(err.error.message, 'Failure');
    });
  }

  savePassword(){
    const user = {
      email: this.email,
      password: this.password
    }

    this.authService.savePassword(user.email, user.password).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200){
        this.toastr.success(res.body.message, 'Success');
        this.router.navigate(['/login']);
      }
    },
    (err: HttpErrorResponse) => {
      this.router.navigate(['/newpassword', this.token]);
      this.toastr.error(err.error.message, 'Failure');
    })
  }

}
