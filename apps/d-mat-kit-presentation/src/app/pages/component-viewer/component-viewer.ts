import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  DNotification,
  DPopoverTrigger,
  DTableModule,
} from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule, MatMenuModule, DPopoverTrigger, DTableModule],
  template: `
    <p>component-viewer works!</p>

    <button
      matButton
      #menuTrigger="matMenuTrigger"
      [matMenuTriggerFor]="menuRed"
      d-popover-trigger-for
    >
      popover trigger red
    </button>

    <mat-menu #menuRed>
      <div style="width: 300px; height: 300px; background-color: red"></div>
    </mat-menu>

    <button
      matButton
      [matMenuTriggerFor]="menuGreen"
      d-popover-trigger-for
      closeOnClick="false"
    >
      popover trigger green
    </button>

    <mat-menu #menuGreen>
      <div
        class="p-2 rounded-lg shadow-md z-10 bg-[var(--mat-sys-surface)] text-xs w-full"
      >
        <p><span class="me-1 after:content-[':']">Tồn kho</span>100,000</p>
      </div>
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
    inject(DNotification).toast({ type: 'warn', message: 'heheheh' });
  }
}
