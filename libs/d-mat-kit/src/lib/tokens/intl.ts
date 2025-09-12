import { InjectionToken } from '@angular/core';
import { DNotificationIntl, DTableIntl } from '../models';

/** Injection token that can be used to internationalize labels for notifications. */
export const NOTIFICATION_INTL = new InjectionToken<DNotificationIntl>(
  'NOFITICATION_INTL'
);

/** Injection token that can be used to internationalize labels for table. */
export const TABLE_INTL = new InjectionToken<DTableIntl>('TABLE_INTL');
