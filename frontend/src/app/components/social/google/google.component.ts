import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-google',
  templateUrl: './google.component.html',
  styleUrls: ['./google.component.css']
})
export class GoogleComponent implements OnInit {

  token: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { 
    this.activatedRoute.params.subscribe((params) => {
      this.token = params['token'];
    });
    // console.log(this.token);
  }

  ngOnInit(): void {
    // console.log(location.pathname);
    if(this.token === 'inactive/error'){
      this.router.navigate(['/login']);
      this.toastr.error('Account is Not yet Activated. Please check your mail', 'Failure');
    } else{
      this.authService.google(this.token);
      this.router.navigate(['/profile']);
      this.toastr.success('You have successfully Logged In', 'Success');
    }
  }

}
