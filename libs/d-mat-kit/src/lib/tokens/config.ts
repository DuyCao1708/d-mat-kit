import { InjectionToken } from '@angular/core';
import { DNofiticationGlobalOptions } from '../models';

/** Injection token that can be used to specify default notification configuration. */
export const NOTIFICATION_OPTIONS =
  new InjectionToken<DNofiticationGlobalOptions>('NOFITICATION_CONFIG');
