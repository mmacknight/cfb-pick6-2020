export class Article {
   id:          number = null;
   author_id:   number = null;
   author_name: string = null;
   author_role: string = null;
   title:       string = null;
   content:     any = null;
   constructor () {}
}

export class Invite {
  user_id: number = null;
  league_id: number = null;
  message: string = null;
  status: number = null;
  id: number = null;
  name: string = null;
  admin: number = null;
  first: string = null;
  last: string = null;
  username: string = null;
}

export class League {
   id: number;
   name: string;
   admin: string;
   constructor () {}
}

export class User {
   id: number;
   first: string;
   last: string;
   username: string;
   password: string;
   email: string;
   constructor () {}
}

export class Story {
   league_id: number;
   user_id: number;
   first: string;
   last: string;
   story: string;
   heading: string;
   constructor () {}
}

export class TimeFrame {
   season: number;
   week: number;
   timestamp: number = Date.now();
   constructor (season?:number, week?:number) {
     this.season = season;
     this.week = week;
   }
}
