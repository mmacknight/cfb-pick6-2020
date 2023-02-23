import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThronePage } from './throne.page';

describe('ThronePage', () => {
  let component: ThronePage;
  let fixture: ComponentFixture<ThronePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThronePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThronePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
