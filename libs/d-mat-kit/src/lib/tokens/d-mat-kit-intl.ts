import { InjectionToken } from '@angular/core';
import { DNotificationIntl } from '../models/notification/notification-intl';
import { DEFAULT_D_NOTIFICATION_INTL } from '../models/notification/default-notification-intl';

/** Injection token that can be used to internationalize labels for notifications. */
export const D_NOTIFICATION_INTL = new InjectionToken<
  Partial<DNotificationIntl>
>('NOFITICATION_INTL', {
  providedIn: 'root',
  factory: () => DEFAULT_D_NOTIFICATION_INTL,
});
