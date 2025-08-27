import { TemplateRef } from '@angular/core';

/**
 * Type of the notification. Affects the visual style of the notification.
 *
 * You can pass either:
 * - A value from the {@link DNotificationType} enum (e.g. `DNotificationType.Success`)
 * - A string literal: `'success'`, `'error'`, or `'warn'`
 */
export enum DNotificationType {
  Error = 'error',
  Success = 'success',
  Warn = 'warn',
}

/**
 * Options for displaying a notification dialog using the DNotification service.
 */
export type DNotificationOptions = {
  /** Type of the notification */
  type: DNotificationType | 'error' | 'success' | 'warn';
  /** The main message content of the notification. */
  message: string;
  /** Custome title displayed in the dialog header. */
  title?: string;
  /** Custom class applied to the dialog title header. */
  titleClass?: string;
  /** Action configuration for displaying an action button or custom template. */
  action?: {
    /** The text label for the action button. */
    label?: string;
    /** The callback function to invoke when the action button is clicked. */
    callback?: () => void;
    /** MatFontIcon name to display inside the action button. */
    icon?: string;
    /** Custom template to override the default action button UI. */
    template?: TemplateRef<any>;
  };
  /** Callback function invoked only when the user clicks the Close button */
  onCloseClick?: () => void;
  /**
   * Whether to display a close button in the notification.
   * Defaults to the global config if not specified.
   */
  showClose?: boolean;
};

/**
 * Options for displaying a toast notification using the DNotification service.
 */
export type DToastOptions = {
  /** Type of the toast */
  type: DNotificationType | 'error' | 'success' | 'warn';
  /** The main message displayed the toast. */
  message: string;
  /** Custom class to apply to the toast container. */
  toastClass?: string;
  /**
   * Duration (in seconds) before the toast automatically disappears.
   * If not provided, the default value from global config will be used.
   */
  timeout?: number;
};

/**
 * Global configuration for DNotification service.
 *
 * Can be overridden using Angular dependency injection.
 */
export type DNoticationConfig = {
  /** Whether to display a close button in the notification. */
  showClose: boolean;
  /** Duration (in seconds) before the toast automatically disappears. */
  toastTimeout: number;
};
