import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  NgZone,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, delay, map, mergeMap, Observable, of, scan, Subject } from 'rxjs';
import { DSvgIconModule } from '../../modules/svg-icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { FILE_UPLOAD_PROGRESS_DATA } from '../../tokens/config';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { _animationsDisabled } from '@angular/material/core';

type FileUploadStatus = 'uploading' | 'completed' | 'error';

type FileProgress = {
  name: string;
  type: string;
  progress: number;
  status: FileUploadStatus;
};

@Component({
  selector: 'd-file-upload-progress-container',
  imports: [MatIconButton, MatIconModule, DSvgIconModule, MatProgressSpinner],
  template: `
    <section class="d-file-upload-progress-header">
      <h3>Upload complete</h3>

      <div>
        <button matIconButton>
          <mat-icon>keyboard_arrow_down</mat-icon>
        </button>

        <button matIconButton>
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </section>

    <section class="d-file-upload-progress-content">
      <!--prettier-ignore-->
      @for (file of files(); track file.name) { 
      @let isCompleted = file.status === 'completed';
      @let isUploading = file.status === 'uploading';

      <div
        class="d-file-upload-progress-item"
        [class.d-file-upload-progress-item-uploading]="isUploading"
      >
        <mat-icon
          [svgIcon]="file.type"
          class="d-file-upload-progress-item-icon"
        ></mat-icon>

        <p class="d-file-upload-progress-item-name">{{ file.name }}</p>

        <div>
          @if (isCompleted) {
          <mat-icon class="d-file-upload-progress-item-success-status">
            check_circle
          </mat-icon>
          } @else if (isUploading) {
          <mat-progress-spinner
            mode="determinate"
            [value]="file.progress"
            diameter="20"
          >
          </mat-progress-spinner>
          } @else {
          <mat-icon class="d-file-upload-progress-item-error-status">
            error </mat-icon
          >}
        </div>
      </div>
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

      .d-file-upload-progress-container-animations-enabled {
        opacity: 0;

        &.d-file-upload-progress-container-enter {
          animation: _d-file-upload-progress-container-enter 150ms
            cubic-bezier(0, 0, 0.2, 1) forwards;
        }

        &.d-file-upload-progress-container-exit {
          animation: _d-file-upload-progress-container-exit 75ms
            cubic-bezier(0.4, 0, 1, 1) forwards;
        }
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
        background-color: var(
          --d-file-upload-progress-content-background-color
        );
        width: var(--d-file-upload-progress-container-width);
        max-height: var(--d-file-upload-progress-container-max-height);
        overflow: auto;
      }

      .d-file-upload-progress-item {
        cursor: pointer;
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 0 16px;
        min-height: 44px;

        &:hover {
          background-color: var(
            --d-file-upload-progress-item-hover-state-color
          );
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
      }

      .d-file-upload-progress-item.d-file-upload-progress-item-uploading
        .d-file-upload-progress-item-icon {
        opacity: 0.2;
      }
    `,
  ],
  host: {
    'animate.enter': 'd-file-upload-progress-animation-enter',
  },
})
export class DFileUploadProgressContainer {
  readonly files = toSignal(
    inject(FILE_UPLOAD_PROGRESS_DATA).pipe(
      mergeMap(({ name, type, progress$ }) =>
        progress$.pipe(
          map((event) => this.mapHttpEventToFileProgress(name, type, event)),
          catchError(() =>
            of({
              name,
              type,
              progress: 0,
              status: 'error',
            } as FileProgress)
          )
        )
      ),
      scan((acc: FileProgress[], curr: FileProgress) => {
        const index = acc.findIndex((file) => file.name === curr.name);
        if (index > -1) acc[index] = { ...acc[index], ...curr };
        else acc.unshift(curr);
        return acc;
      }, [])
    ),
    { initialValue: [] }
  );

  private mapHttpEventToFileProgress(
    name: string,
    type: string,
    event: HttpEvent<any>
  ): FileProgress {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        const progress = event.total
          ? Math.round((event.loaded / event.total) * 100)
          : 0;
        return { name, type, status: 'uploading', progress };
      }
      case HttpEventType.Response:
        return { name, type, status: 'completed', progress: 100 };
      default:
        return { name, type, status: 'uploading', progress: 0 };
    }
  }
}
