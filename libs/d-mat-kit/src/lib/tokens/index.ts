import { makeEnvironmentProviders, Provider } from '@angular/core';
import {
  DNofiticationGlobalOptions,
  DNotificationIntl,
  DTableIntl,
  DTableOptions,
  PartialDTableOptions,
} from '../models';
import {
  FILE_UPLOAD_OPTIONS,
  FILE_UPLOAD_PROGRESS_OPTIONS,
  NOTIFICATION_OPTIONS,
  TABLE_OPTIONS,
} from './config';
import { FILE_UPLOAD_INTL, NOTIFICATION_INTL, TABLE_INTL } from './intl';
import {
  DFileUploadIntl,
  DFileUploadOptions,
  DFileUploadProgressConfig,
} from '../models/file-upload';

enum DMatKitFeatureKind {
  Notification = 0,
  Table = 1,
  FileUpload = 2,
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
    options: Partial<DNofiticationGlobalOptions>;
    intl: Partial<DNotificationIntl>;
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

//#region Table
/** Default table internationalization */
const DEFAULT_TABLE_INTL: DTableIntl = {
  noDataRow: 'No entries found',
};

const DEFAULT_TABLE_OPTIONS: DTableOptions = {
  stickyDefaultHeaderRow: false,
  expandIfSingleRow: true,
  useDefaultNoDataRow: true,
  expandableRow: {
    sticky: true,
    columnName: 'expandedDetail',
  },
  column: {
    dataAccessor: (data: any, name: string) => {
      const _data = data as any;
      const properties = name.split('.');

      const textValue = properties.reduce((currentValue, nestedProperty) => {
        currentValue = currentValue?.[nestedProperty];
        return currentValue;
      }, _data);

      return textValue;
    },

    sort: {
      arrowPosition: 'after',
      disableClear: false,
      disabled: true,
      id: '',
      sortActionDescription: 'Apply sort to this column',
      start: '',
    },

    justify: 'start',
  },
};

/** Configures the table feature with options and internationalization. */
export const withTable = (
  config?: Partial<{
    intl: Partial<DTableIntl>;
    options: PartialDTableOptions;
  }>
): DMatKitFeature<DMatKitFeatureKind> => {
  const providers = [];

  providers.push({
    provide: TABLE_INTL,
    useValue: { ...DEFAULT_TABLE_INTL, ...config?.intl },
  });

  const tableOptions = { ...DEFAULT_TABLE_OPTIONS, ...config?.options };
  tableOptions.column = {
    ...DEFAULT_TABLE_OPTIONS.column,
    ...config?.options?.column,
  };
  tableOptions.expandableRow = {
    ...DEFAULT_TABLE_OPTIONS.expandableRow,
    ...config?.options?.expandableRow,
  };

  providers.push({
    provide: TABLE_OPTIONS,
    useValue: tableOptions,
  });

  return {
    kind: DMatKitFeatureKind.Table,
    providers: providers,
  };
};
//#endregion

//#region File Upload
/** Default file upload configuration */
const DEFAULT_FILE_UPLOAD_OPTIONS: DFileUploadOptions = {
  defaultUploadOption: 'replace',
  ignoreDuplicate: false,
};

/** Default file upload progress configuration */
const DEFAULT_FILE_UPLOAD_PROGRESS_OPTIONS: DFileUploadProgressConfig = {
  horizontalPosition: 'right',
  verticalPosition: 'bottom',
  sideMargin: '24px',
};

/** Default file upload internationalization */
const DEFAULT_FILE_UPLOAD_INTL: DFileUploadIntl = {
  uploadOptionsDialogTitle: 'Upload options',
  replaceOptionLabel: 'Replace existing file',
  keepOptionLabel: 'Keep both files',
  buttonCancelLabel: 'Cancel',
  buttonUploadLabel: 'Upload',
  uploadOptionsDialogContentMessage: (files: File[]) => {
    return (
      (files.length > 1
        ? 'One or more items already uploaded. '
        : `${files[0].name} already uploaded. `) +
      'Do you want to replace the existing items with a new version or keep both items?'
    );
  },
};

/** Configures the file upload feature with options and internationalization. */
export const withFileUpload = (
  config?: Partial<{
    options: Partial<DFileUploadOptions>;
    progress: Partial<DFileUploadProgressConfig>;
    intl: Partial<DFileUploadIntl>;
  }>
): DMatKitFeature<DMatKitFeatureKind> => {
  const providers = [];

  providers.push({
    provide: FILE_UPLOAD_OPTIONS,
    useValue: { ...DEFAULT_FILE_UPLOAD_OPTIONS, ...config?.options },
  });

  providers.push({
    provide: FILE_UPLOAD_PROGRESS_OPTIONS,
    useValue: { ...DEFAULT_FILE_UPLOAD_PROGRESS_OPTIONS, ...config?.progress },
  });

  providers.push({
    provide: FILE_UPLOAD_INTL,
    useValue: { ...DEFAULT_FILE_UPLOAD_INTL, ...config?.intl },
  });

  return {
    kind: DMatKitFeatureKind.FileUpload,
    providers: providers,
  };
};
//#endregion
