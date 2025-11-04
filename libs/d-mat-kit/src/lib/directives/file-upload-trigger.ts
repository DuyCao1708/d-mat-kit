import { Directive, input } from '@angular/core';
import { FileUpload } from '../components';

@Directive({
  selector: '[dFileUploadTriggerFor]',
  host: {
    '(click)': 'dFileUploadTriggerFor()._openDialog()',
  },
})
export class FileUploadTrigger {
  dFileUploadTriggerFor = input.required<FileUpload>();
}
