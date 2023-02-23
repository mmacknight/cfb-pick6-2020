import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError as observableThrowError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { User } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(public httpClient: HttpClient, public router: Router) {

    var previousUser;
    var storage = localStorage.getItem('currentUser');

    if (typeof storage === typeof "string") {
      previousUser = JSON.parse(localStorage.getItem('currentUser'));
      localStorage.setItem('loggedIn', "1");
    } else {
      previousUser = null;
      localStorage.setItem('loggedIn', "0");
    }

    this.currentUserSubject = new BehaviorSubject<User>(previousUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
      return this.currentUserSubject.value;
  }

  login(user: User, redirect_url: string, reroute: boolean = true) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    if (reroute) {
      this.router.navigate(['/'+redirect_url]);
    }
    localStorage.setItem('loggedIn', "1");
  }

  updateUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/auth']);
      localStorage.setItem('loggedIn', "0");
  }

  errorHandler(error: HttpErrorResponse) {
    return observableThrowError(error);
  }
}
