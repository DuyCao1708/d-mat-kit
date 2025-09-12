import { InjectionToken } from '@angular/core';
import { DNofiticationGlobalOptions, DTableOptions } from '../models';

/** Injection token that can be used to specify default notification configuration. */
export const NOTIFICATION_OPTIONS =
  new InjectionToken<DNofiticationGlobalOptions>('NOFITICATION_CONFIG');

/** Injection token that can be used to specify default table default options. */
export const TABLE_OPTIONS = new InjectionToken<DTableOptions>('TABLE_OPTIONS');
