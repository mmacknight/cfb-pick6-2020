import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { League, User, TimeFrame } from '../models';
import { throwError as observableThrowError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url = environment.server+'/api';
  authUrl = environment.server+'/auth';
  public timeFrameSubject: BehaviorSubject<TimeFrame>;
  public timeFrameObservable: Observable<TimeFrame>;

  constructor(public http: HttpClient) {
    var previousUser;

    var storage = JSON.parse(localStorage.getItem('timeFrame')) || null;

    this.timeFrameSubject = new BehaviorSubject<TimeFrame>(storage);
    this.timeFrameObservable = this.timeFrameSubject.asObservable();

    this.updateTimeFrame();
  }

  getLeagues(user_id: number) {
     return this.http.get<any>(`${this.url}/getleagues?_id=${user_id}`).pipe(catchError(this.errorHandler));
  }

  getLeagueInfo(league_id: number) {
     return this.http.get<any>(`${this.url}/get-league-info?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  register(username: string, password: string, first: string, last: string, email: string) {
     return this.http.post<any>(`${this.authUrl}/register`,{ 'username': username, 'password': password, 'first': first, 'last': last, 'email': email}).pipe(catchError(this.errorHandler));
  }

  updateProfile(first: string, last: string, username: string, email: string, id: number) {
     return this.http.post<any>(`${this.url}/update-profile`,{ username: username, first: first, last: last, email: email, id: id}).pipe(catchError(this.errorHandler));
  }

  login(username: string, password: string) {
     return this.http.post<any>(`${this.authUrl}/login`, {username: username, password: password}).pipe(catchError(this.errorHandler));
  }

  createLeague(user_id: number, name: string, info: string) {
     return this.http.post<any>(`${this.url}/create-league`,{ 'admin': user_id, 'name' : name, 'info': info }).pipe(catchError(this.errorHandler));
  }

  updateLeague(league_id: number, name: string, info: string) {
     return this.http.post<any>(`${this.url}/update-league`,{ 'league_id': league_id, 'name' : name, 'info': info }).pipe(catchError(this.errorHandler));
  }

  addTeam(user_id: number, league_id: number) {
     return this.http.post<any>(`${this.url}/add-team`,{ 'user_id': user_id, 'league_id' : league_id }).pipe(catchError(this.errorHandler));
  }

  deleteTeam(user_id: number, league_id: number) {
     return this.http.post<any>(`${this.url}/delete-team`,{ 'user_id': user_id, 'league_id' : league_id }).pipe(catchError(this.errorHandler));
  }

  addInvite(username: string, league_id: number, league_admin: string, league_name: string) {
     return this.http.post<any>(`${this.url}/add-invite`,{ 'username': username, 'league_id' : league_id, 'league_admin' : league_admin, 'league_name' : league_name }).pipe(catchError(this.errorHandler));
  }

  getUserTeams(user_id: number) {
    return this.http.get<any>(`${this.url}/get-user-teams?user_id=${user_id}`).pipe(catchError(this.errorHandler));
  }

  getUserTeamsSchools(user_id: number) {
    return this.http.get<any>(`${this.url}/get-user-teams-schools?user_id=${user_id}`).pipe(catchError(this.errorHandler));
  }

  getUserLeagueStats(user_id: number) {
    return this.http.get<any>(`${this.url}/get-user-league-stats?user_id=${user_id}`).pipe(catchError(this.errorHandler));
  }

  getLeagueTeams(league_id: number) {
    return this.http.get<any>(`${this.url}/get-league-teams?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getLeagueTeamsSchools(league_id: number) {
    return this.http.get<any>(`${this.url}/get-league-teams-schools?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getProfile(user_id: number) {
    return this.http.get<any>(`${this.url}/get-profile?user_id=${user_id}`).pipe(catchError(this.errorHandler));
  }

  getSingleTeam(user_id: number, league_id: number) {
    return this.http.get<any>(`${this.url}/get-single-team?user_id=${user_id}&league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getInvites(email: string) {
    return this.http.get<any>(`${this.url}/get-invites?email=${email}`).pipe(catchError(this.errorHandler));
  }

  getLeagueInvites(league_id: number) {
    return this.http.get<any>(`${this.url}/get-league-invites?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getArticleByID(article_id: number) {
    return this.http.get<any>(`${this.url}/get-article-by-id?article_id=${article_id}`).pipe(catchError(this.errorHandler));
  }

  getArticlesByAuthor(author_id: number) {
    return this.http.get<any>(`${this.url}/get-articles-by-author?author_id=${author_id}`).pipe(catchError(this.errorHandler));
  }

  getArticlesDashboard(limit? :number) {
    if (limit == undefined) {
      return this.http.get<any>(`${this.url}/get-articles-dashboard`).pipe(catchError(this.errorHandler));
    }
    return this.http.get<any>(`${this.url}/get-articles-dashboard?limit=${limit}`).pipe(catchError(this.errorHandler));
  }

  respondInvite(user_id: number, email: string, league_id: number, status: number) {
    return this.http.post<any>(`${this.url}/respond-invite`, {user_id: user_id, email: email, league_id: league_id, status: status}).pipe(catchError(this.errorHandler));
  }

  changeSchools(user_id: number, league_id: number, schools: number[]) {
    return this.http.post<any>(`${this.url}/change-schools`,{ 'user_id': user_id, 'league_id' : league_id, 'schools': schools }).pipe(catchError(this.errorHandler));
  }

  loadDraft(league_id: number) {
    return this.http.post<any>(`${this.url}/load-draft`,{ 'league_id' : league_id }).pipe(catchError(this.errorHandler));
  }

  addSchool(user_id: number, league_id: number, school_id: number, pick: number) {
    return this.http.post<any>(`${this.url}/add-school`,{ 'user_id': user_id, 'league_id' : league_id, 'school_id': school_id, 'pick': pick }).pipe(catchError(this.errorHandler));
  }

  changeSquadName(league_id: number, user_id: number, name: string) {
    return this.http.post<any>(`${this.url}/change-squad-name`,{ user_id: user_id, league_id : league_id, name: name }).pipe(catchError(this.errorHandler));
  }

  getDraft(league_id: number) {
    return this.http.get<any>(`${this.url}/get-draft?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getPicks(league_id: number) {
    return this.http.get<any>(`${this.url}/get-picks?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  createDraft(league_id: number) {
    return this.http.post<any>(`${this.url}/create-draft`, {'league_id' : league_id}).pipe(catchError(this.errorHandler));
  }

  postArticle(author_id: number, title: string, content: string, tease: string) {
    return this.http.post<any>(`${this.url}/post-article`, {'author_id' : author_id, 'title': title, 'content': content, 'tease': tease}).pipe(catchError(this.errorHandler));
  }

  updateArticle(id: number, author_id: number, title: string, content: string, tease: string) {
    return this.http.post<any>(`${this.url}/update-article`, {'id': id, 'author_id' : author_id, 'title': title, 'content': content, 'tease': tease}).pipe(catchError(this.errorHandler));
  }

  deleteDraft(league_id: number) {
    return this.http.post<any>(`${this.url}/delete-draft`, {'league_id' : league_id}).pipe(catchError(this.errorHandler));
  }

  updateSchool(user_id: number, league_id: number, school_id: number, pick: number) {
    return this.http.post<any>(`${this.url}/update-school`,{ 'user_id': user_id, 'league_id' : league_id, 'school_id': school_id, 'pick': pick }).pipe(catchError(this.errorHandler));
  }

  removeSchool(user_id: number, league_id: number, school_id: number) {
    return this.http.post<any>(`${this.url}/remove-school`,{ 'user_id': user_id, 'league_id' : league_id, 'school_id': school_id }).pipe(catchError(this.errorHandler));
  }

  getSupplementalPicks(league_id: number) {
    return this.http.get<any>(`${this.url}/get-supplemental-picks?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  insertSupplemental(league_id: number, school_id: number[]) {
    return this.http.post<any>(`${this.url}/insert-supplemental`,{ league_id: league_id, school_id: school_id}).pipe(catchError(this.errorHandler));
  }

  getSchools() {
    return this.http.get<any>(`${this.url}/get-schools?division=FBS`).pipe(catchError(this.errorHandler));
  }

  getSchoolColors() {
    return this.http.get<any>(`${this.url}/get-school-colors`).pipe(catchError(this.errorHandler));
  }

  getGames(season: number, week: number) {
    return this.http.get<any>(`${this.url}/get-games?season=${season}&week=${week}`).pipe(catchError(this.errorHandler));
  }

  getSeasonWeeks(season: number) {
    return this.http.get<any>(`${this.url}/get-season-weeks?season=${season}`).pipe(catchError(this.errorHandler));
  }

  searchUsers(term: string, user_id: number, league_id: number) {
    return this.http.get<any>(`${this.url}/search-users?term=${term}&user_id=${user_id}&league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  photoUpload(user_id: number, league_id: number, photo: File) {
    const formData = new FormData();
    formData.append('image', photo);
    return this.http.post<any>(`${this.url}/s3-upload?user_id=${user_id}&league_id=${league_id}`,formData).pipe(catchError(this.errorHandler));
  }

  getTimeFrame(): Observable<TimeFrame> {
    this.updateTimeFrame();
    return this.timeFrameObservable;
  }

  updateTimeFrame() {
    var timeFrame = JSON.parse(localStorage.getItem("timeFrame"));
    var hours = 0.1;
    var refreshTime = 1000 * 3600 * hours;
    if (timeFrame == null || Date.now() - timeFrame.timestamp  > refreshTime ) {
      this.http.get<TimeFrame>(`${this.url}/get-time-frame`).pipe(catchError(this.errorHandler))
        .subscribe(
          data => {
            const newTimeFrame = new TimeFrame(data.season,data.week);
            localStorage.setItem('timeFrame', JSON.stringify(newTimeFrame));
            this.timeFrameSubject.next(newTimeFrame);
          }
        )
    }
  }

  getStories(league_id: number) {
    return this.http.get<any>(`${this.url}/get-stories?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getStory(league_id: number, week: number, user_id) {
    return this.http.get<any>(`${this.url}/get-story?league_id=${league_id}&week=${week}&user_id=${user_id}`).pipe(catchError(this.errorHandler));
  }

  postStory(league_id: number, user_id: number, heading: string, story: string) {
    return this.http.post<any>(`${this.url}/post-story`,{ league_id : league_id, user_id: user_id, heading: heading, story: story }).pipe(catchError(this.errorHandler));
  }

  getTicker() {
    return this.http.get<any>(`${this.url}/get-ticker`).pipe(catchError(this.errorHandler));
  }

  getTeamSchedule(school_id: number, season: number) {
    return this.http.get<any>(`${this.url}/get-team-schedule?school_id=${school_id}&season=${season}`).pipe(catchError(this.errorHandler));
  }

  getSquadPicks(user_id: number, league_id: number) {
    return this.http.get<any>(`${this.url}/get-squad-picks?user_id=${user_id}&league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  getChampion(league_id: number) {
    return this.http.get<any>(`${this.url}/get-champion?league_id=${league_id}`).pipe(catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    return observableThrowError(error.message || "Server Error");
  }

}
