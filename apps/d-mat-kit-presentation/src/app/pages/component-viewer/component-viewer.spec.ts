import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentViewer } from './component-viewer';

describe('ComponentViewer', () => {
  let component: ComponentViewer;
  let fixture: ComponentFixture<ComponentViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
