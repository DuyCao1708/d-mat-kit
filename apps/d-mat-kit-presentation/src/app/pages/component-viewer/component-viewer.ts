import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import {
  DNotification,
  DTableModule,
  DMenuTrigger,
  DVirtualOptionForOf,
  DOptionForOf,
} from '@duycaotu/d-mat-kit';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'component-viewer',
  imports: [
    MatButtonModule,
    MatMenuModule,
    DTableModule,
    DMenuTrigger,
    MatFormFieldModule,
    MatSelectModule,
    ScrollingModule,
    DOptionForOf,
  ],
  template: `
    <p>component-viewer works!</p>

    <mat-form-field>
      <mat-label>Toppings</mat-label>
      <mat-select multiple [value]="['hehe_1']">
        <!-- <cdk-virtual-scroll-viewport
          itemSize="48"
          minBufferPx="480"
          maxBufferPx="480"
          style="height: 200px"
        > -->
        <mat-option
          *dOptionFor="let option of options; load: test"
          [value]="option"
        >
          {{ option }}
        </mat-option>
        <!-- </cdk-virtual-scroll-viewport> -->
      </mat-select>
    </mat-form-field>

    <button [dMenuTriggerFor]="menu" dMenuTriggerHoverable="true" matButton>
      trigger
    </button>

    <mat-menu #menu>
      <div style="background-color: red; width: 300px; height: 300px"></div>
    </mat-menu>

    <d-table
      [columns]="[{ name: 'column1', header: ' hehe' }]"
      [dataSource]="[{ column1: '1231231' }]"
    >
    </d-table>
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

  options = Array.from({ length: 100 }).map((_, i) => `hehe_${i}`);

  test = (v: any) => {
    console.log('scrolled to end');

    this.options = [
      ...this.options.concat(
        ...Array.from({ length: 200 })
          .map((_, i) => `hehe_${i}`)
          .slice(100)
      ),
    ];

    console.log(this.options);
  };
}
