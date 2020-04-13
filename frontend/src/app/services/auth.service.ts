import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { map, shareReplay, tap } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';

declare const FB: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private webService: WebRequestService, private router: Router) {
  }

  register(username: string, email: string, password: string, name: string){
    return this.webService.register(username, email, password, name).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
     })
   )
  }

  login(username: string, password: string){
    return this.webService.login(username, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        console.log(res);
        this.setSession(res.body.user._id, res.body.headers['x-access-token'], res.body.headers['x-refresh-token']);
     })
   )
  }

  private setSession(userId: string, accessToken: string, refreshToken: string){
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  private removeSession(){
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  facebook(token: string){
    this.setAccessToken(token);
  }

  twitter(token: string){
    this.setAccessToken(token);
  }

  google(token: string){
    this.setAccessToken(token);
  }

  logout(){
    this.removeSession();
    this.router.navigate(['/']);
  }

  isLoggedIn(){
    if(this.getAccessToken()){
      return true;
    } else{
      return false;
    }
  }

  setAccessToken(token: string){
    localStorage.setItem('x-access-token', token);
  }

  getAccessToken(){
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken(){
    return localStorage.getItem('x-refresh-token');
  }

  getUserId(){
    return localStorage.getItem('user-id');
  }

  getUser(){
    return this.webService.getUser().pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // this.userId = res.body._id;
     })
    );
  }

  getEditUser(id: string){
    return this.webService.getEditUser(id).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // this.userId = res.body._id;
     })
    );
  }

  EditUser(id: string, name: string, username: string, email: string, permission: string){
    return this.webService.EditUser(id, name, username, email, permission).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // this.userId = res.body._id;
     })
    );
  }

  deleteUser(email: string){
    return this.webService.deleteUser(email).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // this.userId = res.body._id;
     })
    );
  }

  getUsers(){
    return this.webService.getUsers().pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // this.userId = res.body._id;
     })
    );
  }

  getNewAccessToken(){
    return this.http.get(`api/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken(),
        '_id': this.getUserId()
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>) => {
        this.setAccessToken(res.body.headers['x-access-token']);
      })
    )
  }

  activateAccount(token: string){
    return this.webService.activateAccount(token).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }

  checkEmail(email: string){
    return this.webService.checkEmail(email).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }

  resendLink(email: string){
    return this.webService.resendLink(email).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }

  sendUsername(email: string){
    return this.webService.sendUsername(email).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }

  sendPassword(email: string){
    return this.webService.sendPassword(email).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }

  resetPassword(token: string){
    return this.webService.resetPassword(token).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }

  savePassword(email: string, password: string){
    return this.webService.savePassword(email, password).pipe(
      tap((res: HttpResponse<any>) => {
        console.log(res);
      })
    );
  }
}
