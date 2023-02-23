import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../services/web-socket.service';
import { UserService } from '../services/user.service';
import { ApiService } from '../services/api.service';
import { TickerService } from '../services/ticker.service';
import { PopoverController } from '@ionic/angular';
import { ConferenceFilterComponent } from '../components/conference-filter/conference-filter.component';
import { DraftSortComponent } from '../components/draft-sort/draft-sort.component';
import * as Math from 'Math';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationEvent
} from '@angular/animations';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-draft',
  templateUrl: './draft.page.html',
  styleUrls: ['./draft.page.scss'],
})
export class DraftPage implements OnInit {

  device_mode: string;
  seg: string = 'order';
  drafted: boolean = false;
  viewing: number = null;
  viewingSchedule = {id: 0, schedule: []};
  viewingPicks = {id: 0, picks: []};
  filter: string = 'All';
  draft_sort: string = 'school';
  id: number = null;
  currentUser = {id: null};
  schools = [];
  pick: number = 1;
  picks = {};
  draft_order = [];
  users = {};
  msg: string = null;
  headings = { wins: 'Wins', school: 'School', vegas: 'Vegas O/U', proj: 'PICK6 Projections', fpi: 'ESPN FPI'};
  last_pick = { pick: 0, school: { id: null, school: null, primary_color: null, secondary_color: null}, user: {id: null, first: null, last: null}};
  season:number = null
  error:any = null

  constructor(public route: ActivatedRoute, public userService: UserService, private tickerService: TickerService, public apiService: ApiService, public socket: WebSocketService, public popoverController: PopoverController, private platform: Platform) {
    this.device_mode = getDevice(this.platform);
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.currentUser = this.userService.currentUserValue;
    this.getSchools();
    this.apiService.getTimeFrame().subscribe(
      data => {
        this.season = data.season;
      },
      error => { this.error = error }
    );
    this.socket.listen(`draft-${this.route.snapshot.paramMap.get('id')}`).subscribe(
      msg => {
        this.msg = msg['message'];
        this.pick = msg['pick'];
        this.last_pick = msg['last_pick'];
        this.last_pick['teams'] = this.draft_order.length;
        this.tickerService.newPick(this.last_pick);
        this.drafted = true;
        setTimeout( ()=>{
          this.drafted = false;
        }, 7000)
        this.picks[this.last_pick.school.id] = 1;
        this.getSquadPicks(this.viewingPicks.id);
        this.incSelect();
      }
    );
    this.socket.listen(`error-${this.route.snapshot.paramMap.get('id')}`).subscribe(
      msg => {
        this.msg = msg['message'];
      },
    );
    this.getPicks();
    this.getDraft();
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.userService.currentUser.subscribe(
      user => {
        this.getSquadPicks(user.id);
      }
    );
  }


  getSchools() {
    this.apiService.getSchools().subscribe(
      data => {
        this.schools = data.schools;
      },
      error => { this.error = error }
    );
  }

  pickSchool(school) {
    const message = {}
    message['league_id'] = this.id;
    message['user'] = this.userService.currentUserValue;
    message['pick'] = this.pick;
    message['school'] = school;
    this.socket.emit('pick',message);
  }

  createDraft() {
    this.apiService.createDraft(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data =>  null,
      error => {
        this.error = error;
      }
    );
  }

  getDraft() {
    this.apiService.getDraft(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        this.draft_order = data['draft'][0]['draft_order'].split('-');
        this.pick = data['draft'][0]['current_pick'];
        this.users = {};
        for (let user of data['users']) {
          this.users[user['id']] = user;
        }
      },
      error => { this.error = error }
    );
  }

  getPicks() {
    this.apiService.getPicks(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        for (let pick of data['picks']) {
          this.picks[pick.school_id] = 1;
        }
      },
      error => { this.error = error }
    )
  }

  arrayNum(n: number): any[] {
    return Array(n);
  }

  getIndex(i: number) {
    if (!this.draft_order.length) {
      return 0;
    }
    return  (i-1) % (this.draft_order.length * 2) == (i-1) % (this.draft_order.length) ?
            (i-1) % (this.draft_order.length) :
            -1 + this.draft_order.length * 2 - (i-1) % (this.draft_order.length * 2);
  }

  trackByFunction(index, item) {
    if (!item) return null;
    return index;
  }

  async presentFilterPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ConferenceFilterComponent,
      event: ev,
      translucent: false
    });

    popover.onDidDismiss().then((result) => {
      if (result.data) {
        this.filter = result.data;
      } else {
        this.filter = 'All';
      }
    });

    return await popover.present();
  }

  async presentSortPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: DraftSortComponent,
      event: ev,
      translucent: false
    });

    popover.onDidDismiss().then((result) => {
      if (result.data) {
        this.draft_sort = result.data;
      } else {
        this.draft_sort = 'school';
      }
    });

    return await popover.present();
  }

  incSelect() {
  }

  incSchool() {
  }

  onSelectDone(event: AnimationEvent) {
  }

  onSchoolDone(event: AnimationEvent) {
  }

  viewSchool(school_id: number) {
    if (school_id == this.viewing) {
      this.viewing = null;
    } else {
      this.viewing = school_id;
      this.getTeamSchedule(school_id);
    }
  }

  getTeamSchedule(school_id: number) {
    this.apiService.getTeamSchedule(school_id, this.season).subscribe(
      data => {
        this.viewingSchedule.id = school_id;
        this.viewingSchedule.schedule = data.schedule;
      },
      error => { this.error = error }
    )
  }

  getSquadPicks(user_id: number) {
    this.apiService.getSquadPicks(user_id, parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        const num_picks = data.picks.length;
        let pick_spot: number = 0;
        for (var i in this.draft_order) {
          if (this.draft_order[i] == user_id) {
            pick_spot = parseInt(i);
          }
        }
        const pick_slots = [pick_spot+1, 2*this.draft_order.length-pick_spot];
        this.viewingPicks.id = user_id;
        this.viewingPicks.picks = data.picks;
        for (let i = num_picks; i < 6; i++) {
          this.viewingPicks.picks.push({pick: pick_slots[i % 2] + Math.floor(i/2) * this.draft_order.length*2, school: "TBD", primary_color: "lightgray", secondary_color: "white", text_color: "white" })
        }
      },
      error => {
        this.error = error;
      }
    )
  }

}
