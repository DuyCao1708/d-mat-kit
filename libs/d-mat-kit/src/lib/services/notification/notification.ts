import { inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  DNotificationOptions,
  DToastOptions,
} from '../../models/notification/notification-options';
import { DNotificationDialog } from '../../components/notification/notification-dialog/notification-dialog';
import { DToastDialog } from '../../components/notification/toast-dialog/toast-dialog';
import { BehaviorSubject, take } from 'rxjs';
import { DToastOptionsWithId } from '../../models/notification/toast-options-with-id';
import { D_NOTIFICATION_CONFIG } from '../../tokens';
import { DEFAULT_D_NOTIFICATION_CONFIG } from '../../models/notification/default-notification-config';

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
  private _toastDialogRef: MatDialogRef<DToastDialog> | null = null;

  private readonly _config = inject(D_NOTIFICATION_CONFIG);
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
   * Displays a toast notification in a shared toast container dialog.
   *
   * @param options {@link DToastOptions} - Toast configuration (message, type, timeout, etc.)
   * @param config Optional Material dialog config overrides
   * @returns A `MatDialogRef` to the toast dialog
   */
  toast(
    options: DToastOptions,
    config?: MatDialogConfig
  ): MatDialogRef<DToastDialog> {
    const dialogConfig = {
      ...config,
      hasBackdrop: false,
      position: {
        top: '16px',
        right: '16px',
      },
      panelClass: 'd-toast-dialog-panel',
      autoFocus: false,
      data: this._toastsOptions$.asObservable(),
    };

    if (!this._toastDialogRef) {
      this._toastDialogRef = this._dialog.open(DToastDialog, dialogConfig);

      this.registerToastDialogRefResetOnClose();
      this.registerRemovalOnToastClose();
    }

    const id = this.setToastOptionsToSubject(options);
    this.removeToastByTimeout(
      id,
      options.timeout ??
        this._config.toastTimeout ??
        DEFAULT_D_NOTIFICATION_CONFIG.toastTimeout
    );

    return this._toastDialogRef;
  }

  private registerRemovalOnToastClose(): void {
    this._toastDialogRef!.componentInstance.close.subscribe((id: number) =>
      this.removeToast(id)
    );
  }

  private removeToastByTimeout(id: number, timeout: number): void {
    setTimeout(() => this.removeToast(id), (timeout + 1) * 1000);
  }

  private removeToast(id: number): void {
    this._toastsOptions = this._toastsOptions.filter((t) => t.id !== id);
    this._toastsOptions$.next(this._toastsOptions);

    if (!this._toastsOptions.length) this._toastDialogRef!.close();
  }

  private setToastOptionsToSubject(options: DToastOptions): number {
    const id = ++this._toastIdCounter;
    this._toastsOptions.push({
      ...options,
      id,
      timeout:
        options.timeout ??
        this._config.toastTimeout ??
        DEFAULT_D_NOTIFICATION_CONFIG.toastTimeout,
      swipeable:
        options.swipeable ??
        this._config.swipeableToast ??
        DEFAULT_D_NOTIFICATION_CONFIG.swipeableToast,
    });
    this._toastsOptions$.next(this._toastsOptions);

    return id;
  }

  private registerToastDialogRefResetOnClose(): void {
    this._toastDialogRef!.afterClosed()
      .pipe(take(1))
      .subscribe(() => (this._toastDialogRef = null));
  }
}
