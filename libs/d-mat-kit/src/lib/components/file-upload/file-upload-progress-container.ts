import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, map, mergeMap, of, scan } from 'rxjs';
import { DSvgIconModule } from '../../modules/svg-icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { FILE_UPLOAD_PROGRESS_DATA } from '../../tokens/config';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { _animationsDisabled } from '@angular/material/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { FILE_UPLOAD_INTL } from '../../tokens/intl';

type FileUploadStatus = 'uploading' | 'completed' | 'error';

type FileProgress = {
  id: number;
  name: string;
  type: string;
  progress: number;
  status: FileUploadStatus;
};

/** Represents the progress of a single file upload. */
@Component({
  selector: 'd-file-upload-progress-item',
  imports: [MatIcon, DSvgIconModule, MatProgressSpinner, MatIconButton],
  template: `
    <mat-icon
      [svgIcon]="fileProgress().type"
      class="d-file-upload-progress-item-icon"
    ></mat-icon>

    <p class="d-file-upload-progress-item-name">{{ fileProgress().name }}</p>

    <div>
      <!--prettier-ignore-->
      @switch(fileProgress().status) { 
      @case ('uploading') {
      <!--prettier-ignore-->
      <div style="margin: 0 8px">
        <mat-progress-spinner
          mode="determinate"
          [value]="fileProgress().progress"
          diameter="20"
        ></mat-progress-spinner>
      </div>
      }
      <!--prettier-ignore-->
      @case ('completed') {
      <button matIconButton>
        <mat-icon class="d-file-upload-progress-item-success-status">
          check_circle
        </mat-icon>
      </button>
      }
      <!--prettier-ignore-->
      @case ('error') {
      <button matIconButton>
        <mat-icon class="d-file-upload-progress-item-error-status">
          error
        </mat-icon>
      </button>
      } }
    </div>
  `,
  styles: [
    `
      :host {
        cursor: pointer;
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 0 16px;

        &:not(.d-file-upload-progress-item-uploading):hover {
          background-color: var(
            --d-file-upload-progress-item-hover-state-color
          );
        }

        &.d-file-upload-progress-item-uploading
          .d-file-upload-progress-item-icon {
          opacity: 0.2;
        }
      }

      .d-file-upload-progress-item-icon {
        width: 16px;
        height: 16px;
        min-width: 16px;
      }

      .d-file-upload-progress-item-name {
        flex: 1;
        color: var(--d-file-upload-progress-item-name-color);
        overflow: hidden;
        display: -webkit-box;
        word-break: break-all;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }

      .d-file-upload-progress-item-success-status {
        color: var(--d-file-upload-progress-item-success-color);
      }

      .d-file-upload-progress-item-error-status {
        color: var(--d-file-upload-progress-item-error-color);
      }
    `,
  ],
  host: {
    '[class.d-file-upload-progress-item-uploading]': 'isUploading()',
  },
})
export class DFileUploadProgressItem {
  /** The progress information of the file to be displayed. */
  fileProgress = input.required<FileProgress>();

  /** Returns true if the file is currently uploading. */
  isUploading = computed(() => this.fileProgress().status === 'uploading');
}

const ENTER_ANIMATION = 'd-file-upload-progress-animation-enter';

/** Represents a container for displaying multiple file upload progress items. */
@Component({
  selector: 'd-file-upload-progress-container',
  imports: [MatIconButton, MatIconModule, DFileUploadProgressItem],
  template: `
    <section class="d-file-upload-progress-header">
      <h3>{{ title() }}</h3>

      <div>
        <button matIconButton (click)="isCollapsed.set(!isCollapsed())">
          <mat-icon
            style="transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
            [style.transform]="isCollapsed() ? 'rotate(180deg)' : 'rotate(0)'"
            >keyboard_arrow_down</mat-icon
          >
        </button>

        <button matIconButton (click)="exit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </section>

    <section
      class="d-file-upload-progress-content"
      [class.d-file-upload-progress-content-collapsed]="isCollapsed()"
    >
      <!--prettier-ignore-->
      @for (file of files(); track file.id) {
      <d-file-upload-progress-item
        [fileProgress]="file"
      ></d-file-upload-progress-item>
      }
    </section>
  `,
  styles: [
    `
      :host {
        border-top-left-radius: var(--d-file-upload-progress-container-shape);
        border-top-right-radius: var(--d-file-upload-progress-container-shape);
        box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
          0 1px 3px 1px rgba(60, 64, 67, 0.15);
      }

      .d-file-upload-progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 52px;
        background-color: var(--d-file-upload-progress-header-background-color);
        padding-left: 16px;
        padding-right: 4px;
        border-top-left-radius: var(--d-file-upload-progress-container-shape);
        border-top-right-radius: var(--d-file-upload-progress-container-shape);

        h3 {
          color: var(--d-file-upload-progress-title-color);
          font-weight: 500;
        }
      }

      .d-file-upload-progress-content {
        transition: max-height 225ms cubic-bezier(0.4, 0, 0.2, 1);
        background-color: var(
          --d-file-upload-progress-content-background-color
        );
        width: var(--d-file-upload-progress-container-width);
        max-height: var(--d-file-upload-progress-container-max-height);
        overflow: auto;

        &.d-file-upload-progress-content-collapsed {
          max-height: 0;
        }
      }
    `,
  ],
  host: {
    'animate.enter': ENTER_ANIMATION,
  },
})
export class DFileUploadProgressContainer {
  private _overlayRef = inject(OverlayRef);
  private _intl = inject(FILE_UPLOAD_INTL);

   /**
   * Signal that holds the list of file progress items.
   *
   * Derived from `FILE_UPLOAD_PROGRESS_DATA`, merges individual file progress streams,
   * maps HttpEvents to `FileProgress`, and accumulates the progress of all files.
   */
  readonly files = toSignal(
    inject(FILE_UPLOAD_PROGRESS_DATA).pipe(
      mergeMap(({ name, type, progress$ }, index) => {
        const id = new Date().getTime() + index;

        return progress$.pipe(
          map((event) =>
            this.mapHttpEventToFileProgress(id, name, type, event)
          ),
          catchError(() =>
            of({
              id,
              name,
              type,
              progress: 0,
              status: 'error',
            } as FileProgress)
          )
        );
      }),
      scan((acc: FileProgress[], curr: FileProgress) => {
        const index = acc.findIndex((file) => file.name === curr.name);
        if (index > -1) acc[index] = { ...acc[index], ...curr };
        else acc.unshift(curr);
        return [...acc];
      }, [])
    ),
    { initialValue: [] }
  );

  /** Computed title of container. */
  readonly title = computed(() => {
    const files = this.files();
    const uploading = files.filter(
      (file) => file.status === 'uploading'
    ).length;
    const completed = files.filter(
      (file) => file.status === 'completed'
    ).length;

    return this._intl.uploadProgressContainerTitle(uploading, completed);
  });

  /** Signal controlling whether the progress list is collapsed. */
  isCollapsed = signal(false);

  /** Closes the progress overlay. */
  exit() {
    this._overlayRef.dispose();
  }

  private mapHttpEventToFileProgress(
    id: number,
    name: string,
    type: string,
    event: HttpEvent<any>
  ): FileProgress {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        const progress = event.total
          ? Math.round((event.loaded / event.total) * 100)
          : 0;
        return { id, name, type, status: 'uploading', progress };
      }
      case HttpEventType.Response:
        return { id, name, type, status: 'completed', progress: 100 };
      default:
        return { id, name, type, status: 'uploading', progress: 0 };
    }
  }
}
