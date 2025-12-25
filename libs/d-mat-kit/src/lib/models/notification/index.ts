import { Direction } from '@angular/cdk/bidi';
import { TemplateRef, ViewContainerRef } from '@angular/core';

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
  /** Custom title displayed in the dialog header. */
  title?: string;
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
  /** The main message displayed the toast. */
  message: string;
  /**
   * Duration (in seconds) before the toast automatically disappears.
   * If not provided, the default value from global config will be used.
   */
  timeout?: number;
  /**
   * Whether the user can close the toast using a swipe gesture.
   * If not provided, the default value from global config will be used.
   */
  swipeable?: boolean;
};

/** Possible values for horizontalPosition on DToastConfig. */
export type DToastHorizontalPosition =
  | 'start'
  | 'center'
  | 'end'
  | 'left'
  | 'right';

/** Possible values for verticalPosition on DToastConfig. */
export type DToastVerticalPosition = 'top' | 'bottom';

/** Configuration used when opening a toast. */
export class DToastConfig {
  /**
   * The view container that serves as the parent for the toast for the purposes of dependency
   * injection. Note: this does not affect where the toast is inserted in the DOM.
   */
  viewContainerRef?: ViewContainerRef;

  /** The length of time in milliseconds to wait before automatically dismissing the toast. */
  duration?: number = 0;

  /** Extra CSS classes to be added to the toast container. */
  panelClass?: string | string[];

  /** Text layout direction for the toast. */
  direction?: Direction;

  /** The horizontal position to place the toast. */
  horizontalPosition?: DToastHorizontalPosition = 'right';

  /** The vertical position to place the toast. */
  verticalPosition?: DToastVerticalPosition = 'top';

  /** Whether the user can close the toast using a swipe gesture. */
  swipeable?: boolean = true;

  /** Type of the toast */
  type: DNotificationType | 'error' | 'success' | 'warn' = 'success';
}

export class DToastRef {
  
}

/** Global options for DNotification service. */
export type DNofiticationGlobalOptions = {
  /** Whether to display a close button in the notification. */
  showClose: boolean;
  /** Duration (in seconds) before the toast automatically disappears. */
  toastTimeout: number;
  /** Whether the user can close the toast using a swipe gesture. */
  swipeableToast: boolean;
};

/**
 * Internationalization (i18n) labels used by the notification components.
 */
export type DNotificationIntl = {
  /** Default title for 'error'-type notifications. */
  titleError: string;
  /** Default title for 'success'-type notifications. */
  titleSuccess: string;
  /** Default title for 'warn'-type notifications. */
  titleWarn: string;
  /** Label for the close button in the dialog notification. */
  buttonCloseLabel: string;
  /** Label for the default action button in the dialog notification. */
  buttonActionLabel: string;
};
