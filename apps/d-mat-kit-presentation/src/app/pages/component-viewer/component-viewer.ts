import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DNotification, DTableModule, DMenuTrigger } from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule, MatMenuModule, DTableModule, DMenuTrigger],
  template: `
    <p>component-viewer works!</p>

    <button
      [dMenuTriggerFor]="menu"
      dMenuTriggerHoverable="true"
      matButton
    >
      trigger
    </button>

    <mat-menu #menu>
      <div style="background-color: red; width: 300px; height: 300px"></div>
    </mat-menu>

    <d-table
      [columns]="[{ name: 'column1', header: ' hehe' }]"
      [dataSource]="[{ column1: '1231231' }]"
    ></d-table>
  `,
  styles: ``,
})
export class ComponentViewer {
  constructor() {
    inject(DNotification).toast({
      type: 'warn',
      message: 'heheheh',
      timeout: 1000,
    });
  }
}
