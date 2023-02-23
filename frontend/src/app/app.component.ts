import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { getDevice} from "./utilities/device";
import { MenuController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UserService } from './services/user.service';
import { ApiService } from './services/api.service';
import { User } from './models';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  device_mode: string = "";
  navigate = [];
  user: User;
  targetElement: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public navCtrl: NavController,
    private menu: MenuController,
    public router: Router,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public userService: UserService
  ) {
    this.targetElement = document.querySelector('#main');
    this.device_mode = getDevice(this.platform);
    this.initializeApp();
    this.navigate =
    [
      {
        title   : "HOME",
        url     : "/",
        fragment: "home",
        icon    : "home"
      },
      {
        title : "MY LEAGUES",
        url   : "/",
        fragment: "myleagues",
        icon  : "grid"
      },
      {
        title : "MEDIA",
        url   : "/",
        fragment: "media",
        icon  : "image"
      },
      {
        title : "ABOUT",
        url   : "/",
        fragment: "about",
        icon  : "help-circle"
      },
      {
        title : "CONTACT",
        url   : "/",
        fragment: "contact",
        icon  : "mail"
      },
    ]

    this.userService.currentUser.subscribe(
      user => this.user = user
    )
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#000040');
      this.splashScreen.hide();
    });
  }

}
