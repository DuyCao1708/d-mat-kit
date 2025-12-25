import { InjectionToken } from '@angular/core';
import { DNofiticationGlobalOptions, DTableOptions } from '../models';
import {
  DFileProgress,
  DFileUploadOptions,
  DFileUploadProgressConfig,
} from '../models/file-upload';
import { Observable } from 'rxjs';

/** Injection token that can be used to specify default notification configuration. */
export const NOTIFICATION_OPTIONS =
  new InjectionToken<DNofiticationGlobalOptions>('NOFITICATION_CONFIG');

/** Injection token that can be used to specify default table options. */
export const TABLE_OPTIONS = new InjectionToken<DTableOptions>('TABLE_OPTIONS');

/** Injection token that can be used to specify default file upload options. */
export const FILE_UPLOAD_OPTIONS = new InjectionToken<DFileUploadOptions>(
  'FILE_UPLOAD_OPTIONS'
);

/** Injection token that can be used to specify default file upload progress config. */
export const FILE_UPLOAD_PROGRESS_OPTIONS =
  new InjectionToken<DFileUploadProgressConfig>('FILE_UPLOAD_PROGRESS_OPTIONS');

/** Injection token that used to inject data to file upload progress container */
export const FILE_UPLOAD_PROGRESS_DATA = new InjectionToken<
  Observable<DFileProgress>
>('FILE_UPLOAD_PROGRESS_DATA');
