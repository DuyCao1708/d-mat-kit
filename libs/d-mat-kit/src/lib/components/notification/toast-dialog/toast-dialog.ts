import { Component, inject, output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Toast } from '../toast/toast';
import { DToastOptionsWithId } from '../../../models/notification/toast-options-with-id';

/**
 * Component dialog container that renders a list of toast notifications.
 */
@Component({
  selector: 'd-toast-dialog',
  imports: [Toast],
  template: `
    @for(options of toastsOptions(); track options.id) {
    <d-toast
      [options]="options"
      [class]="options.toastClass"
      (close)="close.emit(options.id)"
    ></d-toast>
    }
  `,
})
export class DToastDialog {
  /**
   * Signal wrapping an Observable array of toast options with IDs.
   * Used to dynamically render the list of toasts.
   */
  protected readonly toastsOptions = toSignal(
    inject(MAT_DIALOG_DATA) as Observable<DToastOptionsWithId[]>,
    { initialValue: [] }
  );

  /** Emits the ID of the toast that requests to be closed. */
  close = output<number>();
}
