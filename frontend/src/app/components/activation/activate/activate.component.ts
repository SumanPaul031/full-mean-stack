import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {

  token: string;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService, 
    private toastr: ToastrService,
    private router: Router) { 
    this.activatedRoute.params.subscribe((params) => {
      this.token = params['token'];
    })
  }

  ngOnInit(): void {
    // console.log(this.token);
    this.authService.activateAccount(this.token).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200){
        // console.log(res);
        this.router.navigate(['/login']);
        this.toastr.success(res.body.message, 'Success');
      }
    }, 
    (err: HttpErrorResponse) => {
      // console.log(err);
      this.router.navigate(['/login']);
      this.toastr.error(err.error.message, 'Failure');
    });
  }

}
