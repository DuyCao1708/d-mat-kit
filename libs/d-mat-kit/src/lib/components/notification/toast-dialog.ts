import { Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { DToast } from './toast';
import { DToastOptionsWithId } from '../../models/notification/toast-options-with-id';
import { DSwipe } from '../../directives/swipe';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

/**
 * Component outlet that renders a list of toast notifications.
 */
@Component({
  selector: 'd-toasts-outlet',
  imports: [DToast, DSwipe],
  template: `
    @for(options of toastsOptions(); track options.id) {
    <d-toast
      d-swipeable
      [disabled]="!options.swipeable"
      [threshold]="100"
      (swiped)="close.emit(options.id)"
      [options]="options"
      [class]="options.toastClass"
      (close)="close.emit(options.id)"
    ></d-toast>
    }
  `,
})
export class DToastsOutlet {
  /**
   * Signal wrapping an Observable array of toast options with IDs.
   * Used to dynamically render the list of toasts.
   */
  protected readonly toastsOptions = toSignal(
    inject(MAT_SNACK_BAR_DATA) as Observable<DToastOptionsWithId[]>,
    { initialValue: [] }
  );

  /** Emits the ID of the toast that requests to be closed. */
  close = output<number>();
}
