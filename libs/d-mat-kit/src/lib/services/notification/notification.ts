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
import { DNotificationDialog } from '../../components/notification-dialog/notification-dialog';
import { DToastDialog } from '../../components/toast-dialog/toast-dialog';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DNotification {
  private readonly _dialog = inject(MatDialog);
  private readonly _toastsOptions: DToastOptions[] = [];
  private readonly _toastsOptions$ = new BehaviorSubject<DToastOptions[]>(this._toastsOptions);

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
      data: this._toastsOptions$.asObservable(),
    };

    const dialogRef = this._dialog.open(DToastDialog, dialogConfig);

    this.setToastOptionsToSubject(options);

    // setTimeout(() => dialogRef.close(), 5000);

    return dialogRef;
  }

  private setToastOptionsToSubject(options: DToastOptions): void {
    this._toastsOptions.push(options);
    this._toastsOptions$.next(this._toastsOptions);
  }
}
