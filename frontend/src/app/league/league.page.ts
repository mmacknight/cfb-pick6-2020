import { Component, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { User, Story } from '../models';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, RouterEvent } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-league',
  templateUrl: './league.page.html',
  styleUrls: ['./league.page.scss'],
})

export class LeaguePage {

  champion: number = -1;
  offTop: boolean = false;
  seg: string;
  score_display: boolean = true;
  teams = [];
  schools = {};
  id: number = null;
  slideOffset: number = 0;
  slideOffsetFull: number = 0;
  currentUser: User = new User();
  editName: boolean = false;
  league = {name: '', league_admin: -1, league_info: '', team_count: null, first: '', last: ''};
  selectedTeam: number = -1;
  stories: Story[] = [];
  selectedStory: number = this.stories.length ? this.stories.length - 1 : 0;
  games = {};
  weeks = [];
  my_team = {"user_id": -1, "first": '', "last": '', "team_name": ''};
  headings = {home: 'Around The League', standings: 'Standings', scoreboard: 'Scoreboard', myteam: 'My Team'};
  device_mode: string = "";
  currentSlide: number = 0;
  private destroyed$ = new Subject();
  season: number = null;
  week: number = 0;
  current_week: number = 0;
  error:any = null
  @ViewChild('slides', {static: false}) slides:ElementRef;
  @ViewChild('content', {static: false}) content:ElementRef;

  constructor(public apiService: ApiService, public userService: UserService, public socket: WebSocketService, public router: Router, public route: ActivatedRoute, public platform: Platform) {
    this.device_mode = getDevice(this.platform);
    this.getChampion();
    this.userService.currentUser.subscribe(
      user => this.currentUser = user
    );
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.seg = this.router.url.split('#')[1] ? this.router.url.split('#')[1] : 'home';
    this.apiService.getTimeFrame().subscribe(
      data => {
        this.season = data.season;
        this.week = data.week;
        this.current_week = data.week;
        this.getSeasonWeeks(this.season);
      },
      error => { this.error = error }
    );

    this.router.events
      .pipe(
        filter((event: RouterEvent) => event instanceof NavigationEnd),
        takeUntil(this.destroyed$),
      )
      .subscribe((event: NavigationStart) => {
         if (this.router.url.includes('#standings')) {
           this.getTeams();
         }
      });

    this.socket.listen(`scores`).subscribe(
      games => {
        if (this.week == this.current_week) {
          games['map'](g => {
            this.games[g['home']]['home_score'] = g['home_score']
            this.games[g['home']]['away_score'] = g['away_score']
            this.games[g['home']]['shortDetail'] = g['shortDetail']
            this.games[g['home']]['winner'] = g['winner']
            this.games[g['away']]['shortDetail'] = g['home_score']
            this.games[g['away']]['away_score'] = g['away_score']
            this.games[g['away']]['shortDetail'] = g['shortDetail']
            this.games[g['away']]['winner'] = g['winner']
          })
        }
      }
    );
  }

  ionViewDidEnter() {
    this.getChampion();
    this.getTeams();
    this.getLeagueInfo();
    this.getStories();
    this.getGames(this.season, this.week);
  }

  getStories() {
    this.apiService.getStories(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        this.stories = data.stories;
      },
      error => {
        this.error = error
      }
    )
  }

  getSeasonWeeks(season: number) {
    this.apiService.getSeasonWeeks(season).subscribe(
      data => {
        if (data.success) {
          this.weeks = data.weeks;
        }
      },
      error => {
        this.error = error
      }
    );
  }

  getTeams() {
    this.apiService.getLeagueTeams(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          const teams = []
          for (var i in data.teams) {
            teams.push(data.teams[i]);
            if (this.userService.currentUserValue && data.teams[i].user_id == this.userService.currentUserValue.id) {
              this.my_team = data.teams[i];
            }
          }
          this.teams = teams;
          this.getSchools();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  getLeagueInfo() {
    this.apiService.getLeagueInfo(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        this.league = data.league;
      },
      error => {
        this.error = error
      }
    );
  }

  getSchools() {
    this.apiService.getLeagueTeamsSchools(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          const schools = {};
          for (var i in data.schools) {
            var team = data.schools[i];
            if (team.user_id in schools) {
              schools[team.user_id].push(team);
            } else {
              schools[team.user_id] = [];
              schools[team.user_id].push(team);
            }
          }
          this.schools = schools;
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  openSettings() {
    this.router.navigate(['dashboard/settings',this.id]);
  }

  @ViewChild("refresher", {static: false}) refresher;

  async refreshTeams(refresher) {
      await this.getTeams();
      this.refresher.complete();  // Works
  }

  teamWins(user_id: number) {
    if (user_id in this.schools) {
      return this.schools[user_id].map(a => a.wins).reduce((a,b) => a+b);
    } else {
      return 0;
    }
  }

  selectTeam(i: number) {
    if (this.selectedTeam == i) {
      this.selectedTeam = -1;
    } else {
      this.selectedTeam = i;
    }
  }

  selectStory(i: number) {
    if (this.selectedStory == i) {
      this.selectedStory = -1;
    } else {
      this.selectedStory = i;
    }
  }

  getGames(season,week) {
    this.apiService.getGames(season,week).subscribe(
      data => {
        if (data.success) {
          var games = {};
          for (let game of data.games) {
            games[game.home] = game;
            games[game.away] = game;
          }
          this.games = games;
        }
      },
      error => {
        this.error = error
      }
    );
  }

  async slideEvent(event) {

    this.slideOffset = this.slides.nativeElement.scrollLeft;

  }

  slideButton(direction: number) {
    this.slides.nativeElement.scroll({
      top: 0,
      left: this.slideOffset + this.platform.width() * direction,
      behavior: 'smooth'
    });
  }

  segmentNav(segment:string) {
    this.router.navigate(['.'], { relativeTo: this.route, fragment: segment});;
  }

  toggleScoreDisplay() {
    this.score_display = !this.score_display;
  }

  trackByFunction(index, item) {
    if (!item) return null;
    return index;
  }

  setOfftop(event) {
    if (event.detail.scrollTop > 0) {
      this.offTop = true;
    } else {
      this.offTop = false;
    }
  }

  getChampion() {
    this.apiService.getChampion(this.getLeagueId()).subscribe(
      data => {
        if (data.champion) {
          this.champion = data.champion.user_id;
        }
      },
      error => {
        this.error = error
      }
    );
  }

  getLeagueId():number {
    return parseInt(this.route.snapshot.paramMap.get('id'))
  }

  toggleEditName() {
    this.editName = !this.editName;
  }

  changeSquadName(name) {
    this.apiService.changeSquadName(this.getLeagueId(),this.userService.currentUserValue.id,name).subscribe(
      data => {
        this.my_team.team_name = name;
        this.toggleEditName();
        this.teams.map(x =>  {
          if (x.user_id == this.userService.currentUserValue.id) {
            x.team_name = name;
          }
        })
      },
      error => {
        this.error = error
      }
    )
  }
}
