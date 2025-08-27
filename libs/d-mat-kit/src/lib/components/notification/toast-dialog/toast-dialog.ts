import { Component, inject, output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Toast } from '../toast/toast';
import { DToastOptionsWithId } from '../../../models/notification/toast-options-with-id';

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
  protected readonly toastsOptions = toSignal(
    inject(MAT_DIALOG_DATA) as Observable<DToastOptionsWithId[]>,
    { initialValue: [] }
  );

  close = output<number>();
}
