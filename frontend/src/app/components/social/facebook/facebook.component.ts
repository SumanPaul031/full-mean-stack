import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DataSharingService } from 'src/app/services/data-sharing.service';

@Component({
  selector: 'app-facebook',
  templateUrl: './facebook.component.html',
  styleUrls: ['./facebook.component.css']
})
export class FacebookComponent implements OnInit {

  token: string;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService, 
    private router: Router, 
    private toastr: ToastrService,
    private dataSharingService: DataSharingService) { 
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
      this.authService.facebook(this.token);
      this.router.navigate(['/profile']);
      this.toastr.success('You have successfully Logged In', 'Success');
    }
  }

}
