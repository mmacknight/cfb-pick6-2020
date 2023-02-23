import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../services/web-socket.service';
import { UserService } from '../services/user.service';
import { ApiService } from '../services/api.service';
import { TickerService } from '../services/ticker.service';
import { PopoverController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ConferenceFilterComponent } from '../components/conference-filter/conference-filter.component';
import { DraftSortComponent } from '../components/draft-sort/draft-sort.component';
import { SupplementalModalComponent } from '../components/supplemental-modal/supplemental-modal.component';
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
  selector: 'app-supplemental',
  templateUrl: './supplemental.page.html',
  styleUrls: ['./supplemental.page.scss'],
})
export class SupplementalPage implements OnInit {

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
  supplementalPicks = [];
  msg: string = null;
  headings = { wins: 'Wins', school: 'School', vegas: 'Vegas O/U', proj: 'PICK6 Projections', fpi: 'ESPN FPI'};
  last_pick = { pick: 0, school: { id: null, school: null, primary_color: null, secondary_color: null}, user: {id: null, first: null, last: null}};
  error:any = null;
  season:number = null;

  constructor(public route: ActivatedRoute, public userService: UserService, private tickerService: TickerService, public apiService: ApiService, public socket: WebSocketService, public popoverController: PopoverController, public modalController: ModalController, private platform: Platform) {
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
    this.socket.listen(`supplemental-${this.route.snapshot.paramMap.get('id')}`).subscribe(
      msg => {
        this.msg = msg['message'];
        this.last_pick = msg['last_pick'];
        this.last_pick['teams'] = this.draft_order.length;
        this.tickerService.newPick(this.last_pick);
        this.drafted = true;
        setTimeout( ()=>{
          this.drafted = false;
        }, 7000)
        this.picks[this.last_pick.school.id] = 1;
        this.getSquadPicks(this.viewingPicks.id);
        this.getSupplementalPicks();
        this.getPicks();
      }
    );
    this.socket.listen(`error-${this.route.snapshot.paramMap.get('id')}`).subscribe(
      msg => {
        this.getPicks();
        this.msg = msg['message'];
      },
    );
    this.getPicks();
    this.getDraft();
    this.getSupplementalPicks();
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.userService.currentUser.subscribe(
      user => {
        this.getSquadPicks(user.id);
      }
    );
    if (this.supplementalPicks.length < this.draft_order.length * 2) {
      this.presentModal();
    }
  }

  getSupplementalPicks() {
    this.apiService.getSupplementalPicks(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        this.supplementalPicks = data.picks;
        this.pick = this.supplementalPicks.filter(a => a.new_school_id).length + 1;
      },
      error => {
        this.error = error
      }
    )
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SupplementalModalComponent,
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      componentProps: {
        schools: this.viewingPicks,
        league_id: parseInt(this.route.snapshot.paramMap.get('id')),
        supplementalPicks: this.supplementalPicks,
        done: this.supplementalPicks.map(a => a.user_id == this.currentUser.id ? 1 : 0).reduce((x,y) => x + y, 0) >= 2,
        allDone: this.supplementalPicks.length == this.draft_order.length * 2,
      }
    });
    return await modal.present();
  }

  getSchools() {
    this.apiService.getSchools().subscribe(
      data => {
        this.schools = data.schools;
      },
      error =>  { this.error = error }
    );
  }

  pickSchool(school) {
    var message = {}
    message['league_id'] = this.id;
    message['user'] = this.userService.currentUserValue;
    message['pick'] = this.supplementalPicks[this.pick-1].pick;
    message['school'] = school;
    message['old_school_id'] = this.supplementalPicks[this.pick-1].school_id;
    this.socket.emit('supplemental_pick',message);
  }

  passSchool() {
    var message = {}
    message['league_id'] = this.id;
    message['user'] = this.userService.currentUserValue;
    message['pick'] = this.supplementalPicks[this.pick-1].pick;
    message['school'] = this.schools.filter(a => a.id == this.supplementalPicks[this.pick-1].school_id)[0];
    message['school'].school = 'PASS';
    message['school'].primary_color = 'white';
    message['school'].secondary_color = 'white';
    message['school'].text_color = '#000040';
    message['old_school_id'] = this.supplementalPicks[this.pick-1].school_id;
    this.socket.emit('supplemental_pick',message);
  }

  createDraft() {
    this.apiService.createDraft(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => null,
      error => {
        this.error = error
      }
    );
  }

  getDraft() {
    this.apiService.getDraft(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        this.draft_order = data['draft'][0]['draft_order'].split('-');
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
        this.picks = {};
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
    this.apiService.getTeamSchedule(school_id, 2020).subscribe(
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
        var pick_spot: number = 0;
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
      error => { this.error = error }
    )
  }

}
