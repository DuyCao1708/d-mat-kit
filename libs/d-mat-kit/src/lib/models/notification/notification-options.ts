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
};

export type DToastOptions = {
  type: DNotificationType | 'error' | 'success' | 'warn';
  message: string;
};
