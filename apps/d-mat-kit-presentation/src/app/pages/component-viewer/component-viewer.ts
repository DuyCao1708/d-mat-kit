import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
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
  DFileUploadModule,
  DFileUploadProgress,
} from '@duycaotu/d-mat-kit';
import { map, of, pairwise, startWith, Subject, takeUntil } from 'rxjs';

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
    DFileUploadModule,
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
      style="width: 100px; height: 100px; background-color: red"
      [formControl]="formControl"
    >
      Kéo thả hoặc dán ảnh ở đây

      <button matButton dFileUploadTrigger>Hoặc click vào đây</button>
    </d-file-upload>

    <button matButton (click)="download()">download</button>

    <button [dMenuTriggerFor]="menu" dMenuTriggerHoverable="true" matButton>
      trigger
    </button>

    <mat-menu #menu>
      <div style="background-color: red; width: 300px; height: 300px"></div>
    </mat-menu>

    <div style="height: 40px"></div>

    <d-table
      [columns]="[
        { name: 'column1', header: ' Column 1' },
        { name: 'column2', header: ' Column 2' },
        { name: 'column3', header: ' Column 3' }
      ]"
      [dataSource]="[
        {
          column1: 'This is cell 1 content',
          column2: 'This is cell 2 content',
          column3: 'This is cell 3 content',
        }
      ]"
    >
      <ng-container *dHeaderCellDef="'column1'">
        Header 1 template
      </ng-container>

      <ng-container dAltHeaderRow="altHeaderRow">
        <ng-container *dAltHeaderCellDef="'column1'">
          Alternative Header 1 template
        </ng-container>
      </ng-container>

      <ng-container *dCellDef="'column1'">
        This is Cell 1 template
      </ng-container>

      <ng-container dFooterRow="footerRow">
        <ng-container *dFooterCellDef="'column1'">
          Footer 1 template
        </ng-container>
      </ng-container>
    </d-table>
  `,
})
export class ComponentViewer {
  private _progress = inject(DFileUploadProgress);

  constructor() {
    inject(DNotification).toast({
      type: 'warn',
      message: 'heheheh',
      timeout: 1000,
    });

    Array.from({ length: 100 }).map((_, index) =>
      this._progress.track({
        name: 'hehe' + index,
        type: 'application/pdf',
        progress$: of({
          type: HttpEventType.UploadProgress,
          loaded: Math.round(Math.random() * 100),
          total: 100,
        } as HttpEvent<any>),
      })
    );

    const http = inject(HttpClient);

    const uploadedFiles = new WeakSet<File>();

    this.formControl.valueChanges.subscribe((files) => {
      console.log(files);

      for (let file of files || []) {
        if (uploadedFiles.has(file)) continue;

        uploadedFiles.add(file);

        const formData = new FormData();
        formData.append('file', file);

        const progress$ = http.post(
          `https://api.escuelajs.co/api/v1/files/upload`,
          formData,
          {
            reportProgress: true,
            observe: 'events',
          }
        );

        this._progress.track({
          name: file.name,
          type: file.type,
          progress$,
        });
      }
    });
  }

  formControl = new FormControl<File[] | null>(null);

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

  download() {
    const content = `#EXTM3U
#EXTINF:123, Sample artist - Sample title
http://www.example.com/music/sample.mp3
#EXTINF:321,Example Artist - Example title
http://www.example.com/music/example.mp3`;

    // Tạo Blob với MIME type audio/x-mpegurl
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });

    // Tạo URL tạm
    const url = URL.createObjectURL(blob);

    // Tạo thẻ <a> ẩn để download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.m3u'; // Hoặc playlist.m3u8
    a.click();

    // Giải phóng bộ nhớ
    URL.revokeObjectURL(url);
  }
}
