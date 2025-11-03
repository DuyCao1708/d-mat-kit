import { InjectionToken } from '@angular/core';
import { DNofiticationGlobalOptions, DTableOptions } from '../models';
import { DFileUploadOptions } from '../models/file-upload';

/** Injection token that can be used to specify default notification configuration. */
export const NOTIFICATION_OPTIONS =
  new InjectionToken<DNofiticationGlobalOptions>('NOFITICATION_CONFIG');

/** Injection token that can be used to specify default table options. */
export const TABLE_OPTIONS = new InjectionToken<DTableOptions>('TABLE_OPTIONS');

/** Injection token that can be used to specify default file upload options. */
export const FILE_UPLOAD_OPTIONS = new InjectionToken<DFileUploadOptions>('FILE_UPLOAD_OPTIONS');
