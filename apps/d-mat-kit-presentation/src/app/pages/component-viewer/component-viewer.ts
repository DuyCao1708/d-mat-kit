import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DNotification } from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule],
  template: `
    <p>component-viewer works!</p>
    <button matButton (click)="toast()">toast</button>
  `,
  styles: ``,
})
export class ComponentViewer {
  private readonly _notification = inject(DNotification);

  constructor() {
    // this._notification.notify({ type: 'warn', message: 'hehe' });
  }

  toast(): void {
    this._notification.toast({ type: 'warn', message: 'hehe' });
  }
}
