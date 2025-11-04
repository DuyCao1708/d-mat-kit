import { NgModule } from '@angular/core';
import { DFileUploadTrigger } from '../directives';
import { DFileUpload } from '../components/file-upload';

const moduleItems = [DFileUpload, DFileUploadTrigger];

@NgModule({
  declarations: [],
  imports: moduleItems,
  exports: moduleItems,
})
export class DFileUploadModule {}
