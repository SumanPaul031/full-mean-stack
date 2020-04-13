import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  constructor() { }

  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public User: BehaviorSubject<String> = new BehaviorSubject<String>('');

  public Admin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public Moderator: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public Guest: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}
