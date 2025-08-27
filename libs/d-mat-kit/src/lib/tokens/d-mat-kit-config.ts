import { InjectionToken } from '@angular/core';
import { DNoticationConfig } from '../models';

const DEFAULT_D_NOTIFICATION_CONFIG: DNoticationConfig = {
  showClose: true,
};

export const D_NOTIFICATION_CONFIG = new InjectionToken<DNoticationConfig>(
  'NOFITICATION_CONFIG',
  { providedIn: 'root', factory: () => DEFAULT_D_NOTIFICATION_CONFIG }
);
