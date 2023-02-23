import { Component, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { WebSocketService } from '../services/web-socket.service';
import { User } from '../models/user';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage {

  currentUser: User;
  leagues = [];
  teams = {};
  stats = {};
  device_mode: string = "";
  games = [];
  articles = [];
  season: number = null;
  week: number = 0;
  numArticles: number = 5;
  selectedArticle: number = 0;
  error:any = null

  constructor(public apiService: ApiService, public userService: UserService, public socket: WebSocketService, public router: Router, public route: ActivatedRoute, public platform: Platform) {
    this.device_mode = getDevice(this.platform);
    this.currentUser = this.userService.currentUserValue;

    this.apiService.getTimeFrame().subscribe(
      data => {
        this.season = data.season;
        this.week = data.week;
      },
      error => { this.error = error}
    );

    this.socket.listen(`scores`).subscribe(
      games => {
        games['map'](g =>
          this.games.map(x => {
            if (x['gameID'] == g['gameID']) {
              x['home_score'] = g['home_score']
              x['away_score'] = g['away_score']
              x.shortDetail = g.shortDetail.split(' EST')[0]
              x['winner'] = g['winner']
            }
          })
        )
      }
    );
  }

  getGames() {
    this.apiService.getGames(this.season, this.week).subscribe(
      data => {
        this.games = data['games']
        this.games.map(x => {
          if (x.shortDetail.includes('EST')) {
              x.shortDetail = x.shortDetail.split(' EST')[0];
          }
        })
      },
      error => {
        this.error = error
      }
    )
  }

  getArticlesDashboard() {
    this.apiService.getArticlesDashboard().subscribe(
      data => {
        this.articles = data.articles;
      },
      error => {
        this.error = error
      }
    );
  }

  async getLeagues() {
    this.teams = {};
    await this.apiService.getUserTeams(this.userService.currentUserValue.id).subscribe(
      data => {
        if (data.success) {
          if (this.leagues != data.teams) {
            this.leagues = [];
            for (var i in data.teams) {
              this.leagues.push(data.teams[i]);
            }
          }
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
    this.getTeams();
  }

  getTeams() {
    this.apiService.getUserTeamsSchools(this.userService.currentUserValue.id).subscribe(
      data => {
        if (data.success) {
          for (var i in data.teams) {
            var team = data.teams[i];
            if (team.league_id in this.teams) {
              this.teams[team.league_id].push(team);
            } else {
              this.teams[team.league_id] = [];
              this.teams[team.league_id].push(team);
            }
          }
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  async getStats() {
    this.apiService.getUserLeagueStats(this.userService.currentUserValue.id).subscribe(
      data => {
        if (data.success) {
          for (let stat of data['stats']) {
            this.stats[stat.league_id] = {wins: stat.wins, rank: stat.rank}
          }
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }



  openLeague(league) {
    if (league['current_pick'] && league['draft_order'].split('-').length * 6 >= league['current_pick']) {
      this.router.navigate(['/draft',league.id]);
    } else {
      this.router.navigate(['league',league.id]);
    }
  }

  openDraft(league_id: number) {
    this.router.navigate(['draft',league_id]);
  }

  @ViewChild("refresher", {static: false}) refresher;

  async refreshTeams(refresher) {
      await this.getLeagues();
      await this.getStats();
      this.refresher.complete();
  }

  ionViewDidEnter() {
    this.getGames();
    this.getLeagues();
    this.getStats();
    this.getArticlesDashboard();

    // Tweets
    window['twttr']['widgets']['load'](
      document.getElementById("tweets")
    );

  }

  openProfile() {
    this.router.navigate(['profile']);
  }

  trackByFunction(index, item) {
    if (!item) return null;
    return index;
  }

  changeAritcle(skip: number) {
    this.selectedArticle = ((this.selectedArticle + skip + this.numArticles) % this.numArticles % this.articles.length);
  }
}
