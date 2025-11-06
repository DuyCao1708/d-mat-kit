import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideDMatKit,
  withFileUpload,
  withNotification,
  withTable,
} from '@duycaotu/d-mat-kit';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideDMatKit(withNotification(), withTable(), withFileUpload()),
    provideHttpClient(),
  ],
};
