import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TickerService {

  private currentPickSource = new BehaviorSubject(0);
  currentPick = this.currentPickSource.asObservable();

  constructor() {
  }

  newPick(pick) {
    this.currentPickSource.next(pick);
  }

  sendPick() {

  }

}
