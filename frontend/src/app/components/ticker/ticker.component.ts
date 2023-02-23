import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TickerService } from '../../services/ticker.service';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute, NavigationEnd, RouterEvent } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationEvent
} from '@angular/animations';

@Component({
  selector: 'app-ticker',
  animations: [
    trigger('ticker', [
      state('phase_0', style({
        left: '100%',
      })),
      state('phase_1', style({
        left: '-100%',
      })),
      transition('* => phase_0', [
        animate('0s 0s linear')
      ]),
      transition('* => phase_1', [
        animate('0s 20s linear')
      ]),
    ]),
    trigger('schoolBanner', [
      state('phase_0', style({

      })),
      state('phase_1', style({

      })),
      transition('* => phase_0', [
        animate('1s 2s linear')
      ]),
    ]),
  ],
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss'],
})
export class TickerComponent implements OnInit {

  @Input()
  set mode(input) {
    this.device_mode = input;
  }

  public changeNow: boolean;
  public startTime: number;
  public timeValue: any;
  public device_mode: string;
  public stories: string[] = [];
  public tickerState: number = 0;
  public state: number = 0;
  public active: number = -1;
  public drafting: boolean = false;
  private destroyed$ = new Subject();
  private router$: Observable<any>;
  public pickIn: boolean = false;
  public pickedTeam = {school: '', primary_color: 'transparent', secondary_color: 'transparent', text_color: 'transparent'}
  public url: string = null;
  public error: any = null

  constructor(public router: Router, private apiService: ApiService, private tickerService: TickerService, private userService: UserService) {
    this.startTime = Date.now();
    this.changeNow = true;
    this.getTicker();
    this.timeValue = setInterval(() => this.increment(), 1000);
    this.router$ = this.router.events
      .pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed$),
      );

    this.router$.subscribe((event: NavigationEnd) => {
        if (this.drafting && !this.router.url.includes('draft') && !this.router.url.includes('supplemental')) {
          this.drafting = false;
          this.getTicker();
          this.changeNow = true;
        }
        if (this.router.url.includes('draft') || this.router.url.includes('supplemental')) {
          this.changeNow = true;
          this.drafting = true;
          const league_id = parseInt(this.router.url.split('/')[this.router.url.split('/').length - 1]);
          const rounds = [];
          this.apiService.getPicks(league_id).subscribe(
            data => {
                for (let x of data.picks) {
                  if (rounds.length <= Math.floor((x.pick - 1) / data.teams)) {
                    rounds.push(`ROUND ${rounds.length + 1}:  ${x.pick}. ${x.school} (${x.last})`)
                  } else {
                    rounds[Math.floor((x.pick - 1) / data.teams)] += `    ${x.pick}. ${x.school} (${x.last})`;
                  }
                  this.stories = rounds;
                }
            },
            error => { this.error = error }
          );
        }
      });

    this.tickerService.currentPick.subscribe(
      pick => {
        if (this.drafting && pick) {
          if (this.stories.length <= Math.floor((pick['pick'] - 1) / pick['teams'])) {
            this.stories.push(`ROUND ${this.stories.length + 1}:  ${pick['pick']}. ${pick['school']['school']} (${pick['user']['last']})`)
          } else {
            this.stories[Math.floor((pick['pick'] - 1) / pick['teams'])] += `    ${pick['pick']}. ${pick['school']['school']} (${pick['user']['last']})`;
          }
          this.pickedTeam = pick['school'];
          this.pickIn = true;
          setTimeout( ()=>{
            this.pickIn = false;
          }, 6000)
        }
      }
    );
  }

  ngOnInit() {
    setTimeout( ()=>{
      this.increment();
    }, 1000)
  }

  ngOnDestroy() {
    this.pickedTeam = {school: '', primary_color: 'transparent', secondary_color: 'transparent', text_color: 'transparent'};
    this.pickIn = false;
    clearInterval(this.timeValue);
  }

  getTicker() {
    this.apiService.getTicker().subscribe(
      data => {
        this.stories = data;
      },
      error => { this.error = error}
    )
  }

  onTickerDone(event: AnimationEvent) {
    this.tickerState += 1;
  }

  increment() {
    if (this.changeNow || this.startTime + 39000 < Date.now()) {
      this.startTime = Date.now();
      this.changeNow = false;
      this.active = (this.active + 1) % this.stories.length;
    }
  }

  linkProfile() {
    if (this.userService.currentUserValue) {
      this.router.navigate(['/profile'])
    } else {
      this.router.navigate(['/auth'])
    }
  }

  linkDashboard() {
    this.router.navigate(['/'])
  }

}
