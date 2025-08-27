import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DPopover } from '@duycaotu/d-mat-kit';

@Component({
  selector: 'component-viewer',
  imports: [MatButtonModule, MatMenuModule, DPopover],
  template: `
    <p>component-viewer works!</p>
    <button matButton [matMenuTriggerFor]="menu" d-popover-trigger-for>popover trigger</button>

    <mat-menu #menu>
      <div style="width: 300px; height: 300px; background-color: red"></div>
    </mat-menu>
  `,
  styles: ``,
})
export class ComponentViewer {}
