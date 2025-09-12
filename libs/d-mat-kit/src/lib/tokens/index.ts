import { makeEnvironmentProviders, Provider } from '@angular/core';
import { DNofiticationGlobalOptions, DNotificationIntl } from '../models';
import { NOTIFICATION_OPTIONS } from './config';
import { NOTIFICATION_INTL } from './intl';

enum DMatKitFeatureKind {
  Notification = 0,
}

interface DMatKitFeature<KindT extends DMatKitFeatureKind> {
  kind: KindT;
  providers: Provider[];
}

export const provideDMatKit = (
  ...features: DMatKitFeature<DMatKitFeatureKind>[]
) => {
  const providers = features.flatMap((f) => f.providers);

  return makeEnvironmentProviders(providers);
};

//#region Notification
/** Default notification configuration */
const DEFAULT_NOTIFICATION_OPTIONS: DNofiticationGlobalOptions = {
  showClose: true,
  toastTimeout: 5,
  swipeableToast: true,
};

/** Default notification internationalization */
const DEFAULT_NOTIFICATION_INTL: DNotificationIntl = {
  titleError: 'Error',
  titleSuccess: 'Success',
  titleWarn: 'Warn',
  buttonCloseLabel: 'Close',
  buttonActionLabel: 'Confirm',
};

/** Configures the notification feature with options and internationalization. */
export const withNotification = (
  config?: Partial<{
    options?: Partial<DNofiticationGlobalOptions>;
    intl?: Partial<DNotificationIntl>;
  }>
): DMatKitFeature<DMatKitFeatureKind> => {
  const providers = [];

  providers.push({
    provide: NOTIFICATION_OPTIONS,
    useValue: { ...DEFAULT_NOTIFICATION_OPTIONS, ...config?.options },
  });

  providers.push({
    provide: NOTIFICATION_INTL,
    useValue: { ...DEFAULT_NOTIFICATION_INTL, ...config?.intl },
  });

  return {
    kind: DMatKitFeatureKind.Notification,
    providers: providers,
  };
};
//#endregion
