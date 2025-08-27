import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DNotification } from '@duycaotu/d-mat-kit';
import { DSwipe } from 'libs/d-mat-kit/src/lib/directives/swipe';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule, DSwipe],
  template: `<p d-swipeable>component-viewer works!</p>`,
  styles: ``,
})
export class ComponentViewer {
  private readonly _notification = inject(DNotification);

  constructor() {
    // this._notification.notify({ type: 'warn', message: 'hehe' });
    this._notification.toast({
      type: 'success',
      message: 'hehe hehe *hehe* hehe hehe hehe',
      timeout: 1000,
    });
  }
}
