import { Directive, inject, input } from '@angular/core';
import { DFileUpload } from '../components/file-upload';

/** Used to open file upload dialog on click event */
@Directive({
  selector: '[dFileUploadTriggerFor], [dFileUploadTrigger]',
  host: {
    '(click)': 'dFileUploadTriggerFor()?._openDialog()',
  },
})
export class DFileUploadTrigger {
  readonly dFileUpload = inject(DFileUpload, { optional: true });

  /** FileUpload component which this trigger connect to */
  dFileUploadTriggerFor = input<DFileUpload | null>(this.dFileUpload);

  ngOnInit() {
    const fileUpload = this.dFileUploadTriggerFor();
    if (!fileUpload && !this.dFileUpload) {
      throw new Error(
        '[dFileUploadTrigger] must be used inside a <d-file-upload> or have [dFileUploadTriggerFor] set.'
      );
    }
  }
}
