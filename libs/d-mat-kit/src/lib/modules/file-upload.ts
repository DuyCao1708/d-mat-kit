import { NgModule } from '@angular/core';
import { DFileUploadTrigger } from '../directives';
import { DFileUpload } from '../components/file-upload/file-upload';
import { DFileUploadProgressContainer } from '../components/file-upload/file-upload-progress-container';

const moduleItems = [
  DFileUpload,
  DFileUploadTrigger,
  DFileUploadProgressContainer,
];

@NgModule({
  declarations: [],
  imports: moduleItems,
  exports: moduleItems,
})
export class DFileUploadModule {}
