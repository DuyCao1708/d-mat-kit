import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { DToastOptions } from '../../models';
import { Toast } from '../toast/toast';

@Component({
  selector: 'd-toast-dialog',
  imports: [Toast],
  template: `
    @for(options of toastsOptions(); track options.message) {
    <d-toast [options]="options" [class]="options.toastClass"></d-toast>
    }
  `,
})
export class DToastDialog {
  protected readonly toastsOptions = toSignal(
    inject(MAT_DIALOG_DATA) as Observable<DToastOptions[]>,
    { initialValue: [] }
  );
}
