import { InjectionToken } from '@angular/core';
import { DNoticationConfig } from '../models';
import { DEFAULT_D_NOTIFICATION_CONFIG } from '../models/notification/default-notification-config';

/** Injection token that can be used to specify default notification configuration. */
export const D_NOTIFICATION_CONFIG = new InjectionToken<
  Partial<DNoticationConfig>
>('NOFITICATION_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_D_NOTIFICATION_CONFIG,
});
