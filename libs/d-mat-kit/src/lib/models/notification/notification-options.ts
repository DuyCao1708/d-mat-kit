import { TemplateRef } from '@angular/core';

export enum DNotificationType {
  Error = 'error',
  Success = 'success',
  Warn = 'warn',
}

export type DNotificationOptions = {
  type: DNotificationType | 'error' | 'success' | 'warn';
  message: string;
  title?: string;
  titleClass?: string;
  action?: {
    label?: string;
    callback?: () => void;
    icon?: string;
    template?: TemplateRef<any>;
  };
  onClose?: () => void;
  showClose?: boolean;
};

export type DToastOptions = {
  type: DNotificationType | 'error' | 'success' | 'warn';
  message: string;
  toastClass?: string;
  timeout?: number;
};

export type DNoticationConfig = {
  showClose: boolean;
}


