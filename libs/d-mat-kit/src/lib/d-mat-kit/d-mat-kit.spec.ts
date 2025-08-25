import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DMatKit } from './d-mat-kit';

describe('DMatKit', () => {
  let component: DMatKit;
  let fixture: ComponentFixture<DMatKit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DMatKit],
    }).compileComponents();

    fixture = TestBed.createComponent(DMatKit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
