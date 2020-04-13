import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css']
})
export class TwitterComponent implements OnInit {

  token: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { 
    this.activatedRoute.params.subscribe((params) => {
      this.token = params['token'];
    })
  }

  ngOnInit(): void {
    // console.log(location.pathname);
    if(this.token === 'inactive/error'){
      this.router.navigate(['/login']);
      this.toastr.error('Account is Not yet Activated. Please check your mail', 'Failure');
    } else{
      this.authService.twitter(this.token);
      this.router.navigate(['/profile']);
      this.toastr.success('You have successfully Logged In', 'Success');
    }
  }

}
