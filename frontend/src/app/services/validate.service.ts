import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateRegister(user){
    if(user.email === undefined || user.email === null || user.email === '' || user.username == undefined || user.username === null || user.username === '' || user.password == undefined || user.password === null || user.password === '' || user.name == undefined || user.name === null || user.name === ''){
      return false;
    } else{
      return true;
    }
  }

  validateLogin(user){
    if(user.username === undefined || user.username === null || user.username === '' || user.password == undefined || user.password === null || user.password === ''){
      return false;
    } else{
      return true;
    }
  }

  validateEmail(email){
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  }
}
