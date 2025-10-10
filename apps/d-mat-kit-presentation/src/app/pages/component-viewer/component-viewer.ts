import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  DNotification,
  DTableModule,
} from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule, MatMenuModule, DTableModule],
  template: `
    <p>component-viewer works!</p>

    <d-table
      [columns]="[{ name: 'column1', header: ' hehe' }]"
      [dataSource]="[{ column1: '1231231' }]"
    ></d-table>
  `,
  styles: ``,
})
export class ComponentViewer {
  constructor() {
    inject(DNotification).toast({ type: 'warn', message: 'heheheh', timeout: 1000 });
  }
}
