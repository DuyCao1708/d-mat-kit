import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DNotification } from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule],
  template: ` <ng-template #testTemplate><p>component-viewer works!</p></ng-template> `,
  styles: ``,
})
export class ComponentViewer {
  private readonly _notification = inject(DNotification);
  private readonly test = viewChild.required<TemplateRef<any>>('testTemplate')

  constructor() {
    // this._notification.notify({ type: 'warn', message: 'hehe' });
    this._notification.notify({
      type: 'success',
      message: 'hehe hehe *hehe* hehe hehe hehe',
    });
  }
}
