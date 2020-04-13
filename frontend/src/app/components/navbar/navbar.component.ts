import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isUserLoggedIn: boolean;
  val: boolean;
  username;
  isAdmin: boolean;
  isModerator: boolean;
  isGuest: boolean;

  constructor(
    private authService: AuthService, 
    private toastr: ToastrService,
    private dataSharingService: DataSharingService,
    private router: Router) { 
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
      this.authService.getUser().subscribe((res: HttpResponse<any>) => {
        if(res.status === 200){
          // console.log(res.body);
          // this.username = res.body.username;
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
          this.dataSharingService.isUserLoggedIn.next(true);
          this.dataSharingService.User.next(res.body.username);
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

  onLogoutBtnClick(){
    this.authService.logout();
    this.toastr.success('You have Logged Out successfully', 'Success');
    this.router.navigate(['/']);
    this.dataSharingService.isUserLoggedIn.next(false);
  }

}
