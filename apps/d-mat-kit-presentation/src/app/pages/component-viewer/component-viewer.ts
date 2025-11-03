import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import {
  DNotification,
  DTableModule,
  DMenuTrigger,
  DInfiniteScroll,
  FileUpload,
} from '@duycaotu/d-mat-kit';

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
    DInfiniteScroll,
    MatAutocompleteModule,
    MatInput,
    FileUpload,
    ReactiveFormsModule,
  ],
  template: `
    <p>component-viewer works!</p>

    <mat-form-field>
      <mat-label>Toppings</mat-label>
      <mat-select multiple [value]="['hehe_1']" [dInfiniteScrollLoad]="test">
        <!-- <cdk-virtual-scroll-viewport
          itemSize="48"
          minBufferPx="480"
          maxBufferPx="480"
          style="height: 200px"
        > -->
        @for(option of options; track option.value ) {
        <mat-option [value]="option.value">{{ option.text }}</mat-option>
        }

        <!-- </cdk-virtual-scroll-viewport> -->
      </mat-select>
    </mat-form-field>

    <mat-form-field style="margin-left: 16px">
      <mat-label>Toppings</mat-label>
      <input
        type="text"
        placeholder="Pick one"
        aria-label="Number"
        matInput
        [matAutocomplete]="auto"
      />
      <mat-autocomplete
        autoActiveFirstOption
        #auto="matAutocomplete"
        [dInfiniteScrollLoad]="test"
      >
        @for (option of options; track option.value) {
        <mat-option [value]="option">{{ option.text }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>

    <d-file-upload
      style="width: 50px; height: 50px; background-color: red"
      [formControl]="formControl"
    >
      Tải ảnh ở đây
    </d-file-upload>

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
      <ng-container dAltHeaderRow="hehe" trClass="bg-red-500">
        <ng-container *dAltHeaderCellDef="'column1'" d-alt-header-cell
          >alt header</ng-container
        >
      </ng-container>
    </d-table>
  `,
})
export class ComponentViewer {
  constructor() {
    inject(DNotification).toast({
      type: 'warn',
      message: 'heheheh',
      timeout: 1000,
    });

    this.formControl.valueChanges.subscribe(console.log)
  }

  formControl = new FormControl(null);

  options = Array.from({ length: 100 }).map((_, i) => ({
    value: i,
    text: `hehe_${i}`,
  }));

  test = (v: any) => {
    console.log('scrolled to end');

    this.options = [
      ...this.options.concat(
        ...Array.from({ length: 200 })
          .map((_, i) => ({ value: i, text: `hehe_${i}` }))
          .slice(100)
      ),
    ];

    console.log(this.options);
  };
}
