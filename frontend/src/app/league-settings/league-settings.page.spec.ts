import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LeagueSettingsPage } from './league-settings.page';

describe('LeagueSettingsPage', () => {
  let component: LeagueSettingsPage;
  let fixture: ComponentFixture<LeagueSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeagueSettingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeagueSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
