import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SupplementalPage } from './supplemental.page';

describe('SupplementalPage', () => {
  let component: SupplementalPage;
  let fixture: ComponentFixture<SupplementalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplementalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplementalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
