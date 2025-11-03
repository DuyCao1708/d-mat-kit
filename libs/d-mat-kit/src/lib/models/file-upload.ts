export type FileUploadOptionResult = 'replace' | 'keep';

/** Provides default options to upload files */
export type DFileUploadOptions = {
  defaultUploadOption: FileUploadOptionResult;
  uploadOptionsDialogTitleClass?: string;
  ignoreDuplicate: boolean;
};

/**
 * Internationalization (i18n) labels used by the file upload components.
 */
export type DFileUploadIntl = {
  /** Title displayed in the upload options dialog header. */
  uploadOptionsDialogTitle: string;
  /** Label for the replace existing file option in the upload options dialog */
  replaceOptionLabel: string;
  /** Label for the keep both files option in the upload options dialog */
  keepOptionLabel: string;
  /** Label for the cancel button in the upload options dialog. */
  buttonCancelLabel: string;
  /** Label for the upload button in the upload options dialog. */
  buttonUploadLabel: string;
  /** Message displays in the upload options dialog. Markdown supported */
  uploadOptionsDialogContentMessage: (files: File[]) => string;
};
