import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DNotification, DTableModule, DMenuTrigger } from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule, MatMenuModule, DTableModule, DMenuTrigger],
  template: `
    <p>component-viewer works!</p>

    <button [dMenuTriggerFor]="menu" dMenuTriggerHoverable="true" matButton>
      trigger
    </button>

    <mat-menu #menu>
      <div style="background-color: red; width: 300px; height: 300px"></div>
    </mat-menu>

    <d-table
      [columns]="[{ name: 'column1', header: ' hehe' }]"
      [dataSource]="[]"
    >
      <ng-container dAltHeaderRow="hehe" trClass="bg-red-500">
        <ng-container *dAltHeaderCellDef="'column1'">alt header</ng-container>
      </ng-container>
    </d-table>
  `,
  styles: [
    `
    `,
  ],
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
