import { inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { DNotificationOptions, DToastOptions } from '../../models/notification/notification-options';
import { DNotificationDialog } from '../../components/notification-dialog/notification-dialog';
import { DToastDialog } from '../../components/toast-dialog/toast-dialog';

@Injectable({
  providedIn: 'root',
})
export class DNotification {
  private readonly _dialog = inject(MatDialog);

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
        right: '16px'
      },
      panelClass: 'd-toast-dialog-panel',
      data: options,
    };

    const dialogRef = this._dialog.open(DToastDialog, dialogConfig);

    // setTimeout(() => dialogRef.close(), 5000);

    return dialogRef;
  }
}
