import { inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { DNotificationOptions, DToastConfig, DToastOptions, DToastRef } from '../models/notification';
import { BehaviorSubject, take } from 'rxjs';
import { DToastOptionsWithId } from '../models/notification/toast-options-with-id';
import { NOTIFICATION_OPTIONS } from '../tokens/config';
import { DToastsOutlet } from '../components/notification/toast-dialog';
import { DNotificationDialog } from '../components/notification/notification-dialog';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

/**
 * Service to open notification dialogs.
 */
@Injectable({
  providedIn: 'root',
})
export class DNotification {
  private readonly _dialog = inject(MatDialog);
  private _toastsOptions: DToastOptionsWithId[] = [];
  private readonly _toastsOptions$ = new BehaviorSubject<DToastOptionsWithId[]>(
    this._toastsOptions
  );
  private _toastSnackBarRef: MatSnackBarRef<DToastsOutlet> | null = null;

  private readonly _defaultOptions = inject(NOTIFICATION_OPTIONS);
  private _toastIdCounter = 0;

  /**
   * Opens a notification dialog.
   *
   * @param options {@link DNotificationOptions} - Notification configuration (message, type, title, etc.)
   * @param config Optional Material dialog config overrides
   * @returns A `MatDialogRef` to the opened notification dialog
   */
  notify(
    options: DNotificationOptions,
    config?: MatDialogConfig
  ): MatDialogRef<DNotificationDialog> {
    const dialogConfig = { ...config, data: options };

    return this._dialog.open(DNotificationDialog, dialogConfig);
  }

  /**
   * Displays a toast notification in a shared toast snackbar outlet.
   *
   * @param options {@link DToastOptions} - Toast configuration (message, type, timeout, etc.)
   * @param config Optional Material snackbar config overrides
   * @returns A `MatSnackBarRef` to the toasts outlet
   */
  toast(
    message: string,
    config?: DToastConfig
  ): DToastRef |void {
    // const snackBarConfig: MatSnackBarConfig = {
    //   ...config,
    //   horizontalPosition: config?.horizontalPosition ?? 'end',
    //   verticalPosition: config?.verticalPosition ?? 'top',
    //   panelClass: [
    //     ...([config?.panelClass].flat().filter(Boolean) as string[]),
    //     'd-toasts-snack-bar-container',
    //   ],
    //   data: this._toastsOptions$.asObservable(),
    // };

    // if (!this._toastSnackBarRef) {
    //   this._toastSnackBarRef = this._matSnackBar.openFromComponent(
    //     DToastsOutlet,
    //     snackBarConfig
    //   );

    //   this.listenToDialogClose();
    //   this.listenToToastClose();
    // }

    // const id = this.setToastOptionsToSubject(options);
    // this.removeToastByTimeout(
    //   id,
    //   options.timeout ?? this._defaultOptions.toastTimeout
    // );

    // return this._toastSnackBarRef;
  }

  private listenToToastClose(): void {
    this._toastSnackBarRef!.instance.close.subscribe((id: number) =>
      this.removeToast(id)
    );
  }

  private removeToastByTimeout(id: number, timeout: number): void {
    setTimeout(() => this.removeToast(id), (timeout + 1) * 1000);
  }

  private removeToast(id: number): void {
    this._toastsOptions = this._toastsOptions.filter((t) => t.id !== id);
    this._toastsOptions$.next(this._toastsOptions);

    if (!this._toastsOptions.length) this._toastSnackBarRef!.dismiss();
  }

  private setToastOptionsToSubject(options: DToastOptions): number {
    const id = ++this._toastIdCounter;
    this._toastsOptions.push({
      ...options,
      id,
      timeout: options.timeout ?? this._defaultOptions.toastTimeout,
      swipeable: options.swipeable ?? this._defaultOptions.swipeableToast,
    });
    this._toastsOptions$.next(this._toastsOptions);

    return id;
  }

  private listenToDialogClose(): void {
    this._toastSnackBarRef!.afterDismissed()
      .pipe(take(1))
      .subscribe(() => (this._toastSnackBarRef = null));
  }





  // private attach()
}
