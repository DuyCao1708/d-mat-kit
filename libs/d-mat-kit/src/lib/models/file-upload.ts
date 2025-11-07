import { Direction } from '@angular/cdk/bidi';
import { HttpEvent } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';

/** Value returned from the upload options dialog */
export type DFileUploadOptionResult = 'replace' | 'keep';

/** Possible values for horizontalPosition on DFileUploadProgressConfig. */
export type DFileUploadProgressHorizontalPosition =
  | 'start'
  | 'center'
  | 'end'
  | 'left'
  | 'right';

/** Configure file upload progress display. */
export type DFileUploadProgressConfig = {
  /**
   * The view container that serves as the parent for the snackbar for the purposes of dependency
   * injection. Note: this does not affect where the snackbar is inserted in the DOM.
   */
  viewContainerRef?: ViewContainerRef;
  /** Text layout direction for the upload progress container. */
  direction?: Direction;
  /** The horizontal position to place the upload progress container. */
  horizontalPosition?: DFileUploadProgressHorizontalPosition;
  /** The horizontal offset of the overlay from the left or right edge of the viewport */
  sideMargin?: string;
};

/** Represents the progress of a single file being uploaded. */
export type DFileProgress = {
  /** The name of the file. */
  name: string;
  /** The MIME type of the file (e.g., "image/png"). */
  type: string;
  /** An Observable that emits `HttpEvent<any>` objects, tracking the upload progress and response of the file. */
  progress$: Observable<HttpEvent<any>>;
};

/** Reference to a container dispatched from the file upload progress service. */
export class DFileUploadProgressContainerRef {
  /** Subject for notifying the user that the snack bar has been dismissed. */
  private readonly _afterDismissed = new Subject<void>();

  constructor(private _overlayRef: OverlayRef) {
    this._overlayRef.detachments().subscribe(() => this._finishDismiss());
  }

  /** Dismisses the container. */
  dismiss(): void {
    if (!this._afterDismissed.closed) {
      this._finishDismiss();
    }
  }

  /** Gets an observable that is notified when the container is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterDismissed.asObservable();
  }

  private _finishDismiss() {
    this._overlayRef.dispose();
    this._afterDismissed.next();
    this._afterDismissed.complete();
  }
}

/** Provides default options to upload files */
export type DFileUploadOptions = {
  /** Default option displayed in the upload options dialog */
  defaultUploadOption: DFileUploadOptionResult;
  /** CSS class applied in the upload options dialog title */
  uploadOptionsDialogTitleClass?: string;
  /** Whether to automatically ignore duplicate files or process them */
  ignoreDuplicate: boolean;
};

/**
 * Internationalization (i18n) labels used by the file upload components.
 */
export type DFileUploadIntl = {
  /** Title displayed in the upload options dialog header. */
  uploadOptionsDialogTitle: string;
  /** Label for the replace existing file option in the upload options dialog */
  replaceOptionLabel: string;
  /** Label for the keep both files option in the upload options dialog */
  keepOptionLabel: string;
  /** Label for the cancel button in the upload options dialog. */
  buttonCancelLabel: string;
  /** Label for the upload button in the upload options dialog. */
  buttonUploadLabel: string;
  /** Message displays in the upload options dialog. Markdown supported */
  uploadOptionsDialogContentMessage: (files: File[]) => string;
  /** File upload progress container title. */
  uploadProgressContainerTitle: (
    uploading: number,
    completed: number
  ) => string;
};
