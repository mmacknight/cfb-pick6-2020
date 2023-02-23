import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-supplemental-modal',
  templateUrl: './supplemental-modal.component.html',
  styleUrls: ['./supplemental-modal.component.scss'],
})
export class SupplementalModalComponent implements OnInit {

  @Input() schools;
  @Input() league_id;
  @Input() done;
  @Input() allDone;

  public isFull: boolean = false;
  public checked = [0,0,0,0,0,0];
  public error:any = null;

  constructor(private apiService: ApiService, private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.allDone) {
      this.dismiss();
    }
  }

  checkSum() {
    this.isFull = this.checked.reduce((a,b) => a + b) >= 2;
  }

  insertSupplemental() {
    var indexes = [];
    for (var i in this.checked) {
      if (this.checked[i]) {
        indexes.push(i);
      }
    }
    this.apiService.insertSupplemental(this.league_id, [this.schools['picks'][indexes[0]].school_id,this.schools['picks'][indexes[1]].school_id]).subscribe(
      data => {
        this.done = true;
      },
      error => {
        this.error = error
      }
    );
  }

  isChecked(element, index, array) {
    if (this.checked[index]) {
      return true;
    } else {
      return false;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  refresh(): void {
      window.location.reload();
  }
}
