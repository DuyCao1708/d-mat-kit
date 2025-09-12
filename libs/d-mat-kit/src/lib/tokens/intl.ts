import { InjectionToken } from '@angular/core';
import { DNotificationIntl } from '../models';

/** Injection token that can be used to internationalize labels for notifications. */
export const NOTIFICATION_INTL = new InjectionToken<DNotificationIntl>(
  'NOFITICATION_INTL'
);
