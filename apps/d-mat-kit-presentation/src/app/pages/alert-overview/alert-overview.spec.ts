import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertOverview } from './alert-overview';

describe('AlertOverview', () => {
  let component: AlertOverview;
  let fixture: ComponentFixture<AlertOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
