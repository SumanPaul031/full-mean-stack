import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {

  email: string;
  disable: boolean = false;
  expired: boolean = false;

  constructor(private authService: AuthService, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
  }

  sendPassword(){
    this.authService.sendPassword(this.email).subscribe((res: HttpResponse<any>) => {
      // console.log(res);
      this.toastr.success(res.body.message, 'Success');
      this.router.navigate(['/login']);
    },
    (err: HttpErrorResponse) => {
      // console.log(err.error.message);
      if(err.error.expired){
        this.expired = true;
        this.disable = true;
      }
      this.toastr.error(err.error.message, 'Failure');
      this.router.navigate(['/resetpassword']);
    })
  }

  onResendClick(){
    this.authService.checkEmail(this.email).subscribe((res: HttpResponse<any>) => {
      // console.log(res);
      if(res.status === 200){
        // console.log(res);
        // this.router.navigate(['/login']);
        // this.toastr.success('Activation Link Sent to Email', 'Success');
        this.authService.resendLink(this.email).subscribe((res: HttpResponse<any>) => {
          if(res.status === 200){
            // console.log(res);
            this.toastr.success(res.body.message, 'Success');
            this.disable = true;
            this.router.navigate(['/login']);
          }
        })
      }
    },
    (err: HttpErrorResponse) => {
      // console.log(err.error.message);
      this.toastr.error(err.error.message, 'Failure');
      this.disable = false;
      this.router.navigate(['/resetpassword']);
    })
  }

}
