import { Component, inject } from '@angular/core';
import { DNotification } from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [],
  template: ` <p>component-viewer works!</p> `,
  styles: ``,
})
export class ComponentViewer {
  constructor() {
    inject(DNotification).toast({ type: 'warn', message: 'hehe' });
  }
}
