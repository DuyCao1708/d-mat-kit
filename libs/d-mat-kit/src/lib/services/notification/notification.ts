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
  private readonly DEFAULT_TOAST_TIMEOUT = 5;
  private _toastIdCounter = 0;

  notify(
    options: DNotificationOptions,
    config?: MatDialogConfig
  ): MatDialogRef<DNotificationDialog> {
    const dialogConfig = { ...config, data: options };

    return this._dialog.open(DNotificationDialog, dialogConfig);
  }

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
      options.timeout || this.DEFAULT_TOAST_TIMEOUT
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
      timeout: options.timeout || this.DEFAULT_TOAST_TIMEOUT,
      id,
    });
    this._toastsOptions$.next(this._toastsOptions);
    console.log(this._toastsOptions);

    return id;
  }

  private registerToastDialogRefResetOnClose(): void {
    this._toastDialogRef!.afterClosed()
      .pipe(take(1))
      .subscribe(() => (this._toastDialogRef = null));
  }
}
