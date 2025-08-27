import { InjectionToken } from '@angular/core';
import { DNotificationIntl } from '../models/notification/notification-intl';

/** Injection token that can be used to internationalize labels for notifications. */
export const D_NOTIFICATION_INTL = new InjectionToken<DNotificationIntl>(
  'NOFITICATION_INTL'
);
