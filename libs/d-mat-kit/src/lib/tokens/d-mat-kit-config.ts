import { InjectionToken } from '@angular/core';
import { DNoticationConfig } from '../models';

/** Default notification configuration */
const DEFAULT_D_NOTIFICATION_CONFIG: DNoticationConfig = {
  showClose: true,
  toastTimeout: 5,
};

/** Injection token that can be used to specify default notification configuration. */
export const D_NOTIFICATION_CONFIG = new InjectionToken<DNoticationConfig>(
  'NOFITICATION_CONFIG',
  { providedIn: 'root', factory: () => DEFAULT_D_NOTIFICATION_CONFIG }
);
