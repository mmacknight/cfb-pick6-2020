import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthGuardService implements CanActivate {
  constructor(public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (localStorage.getItem("loggedIn") != "1") {
      this.router.navigate(["auth"]);
      return false;
    }

    return true;
  }
}
