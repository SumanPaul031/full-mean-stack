import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-resend',
  templateUrl: './resend.component.html',
  styleUrls: ['./resend.component.css']
})
export class ResendComponent implements OnInit {

  email: string;
  disable: boolean = false;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onResendSubmit(){
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
      this.router.navigate(['/resend']);
    })
  }

}
