import { Component, OnInit } from '@angular/core';
import { DataSharingService } from 'src/app/services/data-sharing.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  isUserLoggedIn: boolean;
  val: boolean;

  constructor(private dataSharingService: DataSharingService) { 
    this.dataSharingService.isUserLoggedIn.subscribe( value => {
      this.isUserLoggedIn = value;
    });
  }

  ngOnInit(): void {
    this.val = localStorage.getItem('x-access-token') ? true : false;

    if(this.val){
      this.dataSharingService.isUserLoggedIn.next(true);
    } else{
      this.dataSharingService.isUserLoggedIn.next(false);
    }
  }

}
