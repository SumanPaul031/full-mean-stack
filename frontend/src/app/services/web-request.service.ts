import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  constructor(private http: HttpClient) { }

  get(uri: string){
    // return this.http.get(`${this.ROOT_URL}/${uri}`);
    return this.http.get(`${uri}`);
  }

  post(uri: string, payload: Object){
    // return this.http.post(`${this.ROOT_URL}/${uri}`, payload);
    return this.http.post(`${uri}`, payload);
  }

  register(username: string, email: string, password: string, name: string){
    // return this.http.post(`${this.ROOT_URL}/users/register`, {
    //   name,
    //   username,
    //   email,
    //   password
    // }, { observe: 'response' });
    return this.http.post(`/api/users`, {
      username,
      email,
      password,
      name
    }, { observe: 'response' });
  }

  login(username: string, password: string){
    // return this.http.post(`${this.ROOT_URL}/users/register`, {
    //   name,
    //   username,
    //   email,
    //   password
    // }, { observe: 'response' });
    return this.http.post(`/api/authenticate`, {
      username,
      password
    }, { observe: 'response' });
  }

  getUser(){
    return this.http.get(`/api/me`, { observe: 'response' });
  }

  getEditUser(id: string){
    return this.http.get(`/api/edit/${id}`, { observe: 'response' });
  }

  EditUser(id: string, name: string, username: string, email: string, permission: string){
    return this.http.put(`/api/edit/${id}`, {name, username, email, permission}, {observe: 'response'});
  }

  getUsers(){
    return this.http.get(`/api/management`, { observe: 'response' });
  }

  deleteUser(email: string){
    return this.http.delete(`/api/management/${email}`, { observe: 'response' });
  }

  activateAccount(token: string){
    return this.http.get('/api/activate/'+token, { observe: 'response' });
  }

  checkEmail(email: string){
    return this.http.post('/api/resend', {email}, { observe: 'response' });
  }

  resendLink(email: string){
    return this.http.put('/api/resend', {email}, { observe: 'response' });
  }

  sendUsername(email: string){
    return this.http.get('/api/resetusername/'+email, {observe: 'response'});
  }

  sendPassword(email: string){
    return this.http.put('/api/resetpassword', {email}, {observe: 'response'});
  }

  resetPassword(token: string){
    return this.http.get('/api/newpassword/'+token, { observe: 'response' });
  }

  savePassword(email: string, password: string){
    return this.http.put('/api/savepassword', {email, password}, {observe: 'response'});
  }
}
