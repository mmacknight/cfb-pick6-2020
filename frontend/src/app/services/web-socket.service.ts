import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;
  public uri: string = environment.server;

  constructor() {
    this.socket = io(this.uri, {secure: true});
  }

  listen(eventname: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventname, data => {
        subscriber.next(data);
      })
    });
  }

  emit(eventname: string, data: any) {
    this.socket.emit(eventname,data);
  }
}
