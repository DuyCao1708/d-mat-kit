import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  inject,
  Input,
  input,
  output,
  Renderer2,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { FILE_UPLOAD_INTL } from '../../tokens/intl';
import {
  DFileUploadOptionResult,
} from '../../models/file-upload';
import { FILE_UPLOAD_OPTIONS } from '../../tokens/config';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';

type FileValue = File | File[] | FileList | null | undefined;

const DEFAULT_SCREENSHOT_IMAGE_NAMES = ['image.png', 'ảnh.png'];

/** Component handles file uploads via click, drag-and-drop or paste actions. */
@Component({
  selector: 'd-file-upload',
  template: `
    <ng-content></ng-content>
    <input
      #fileInput
      style="display: none"
      type="file"
      [multiple]="multiple()"
      [accept]="accept()"
      [disabled]="disabled"
      (change)="_setValue($any($event.target).files)"
      (cancel)="cancel.emit()"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        cursor: pointer;
      }
    `,
  ],
  host: {
    // To prevent opening file by browser
    '(dragover)': '$event.preventDefault()',
    '(drop)': '_setValueOnDrop($event)',
    '(paste)': '_setValueOnPaste($event)',
    '(blur)': '_onTouched()',
  },
})
export class DFileUpload implements ControlValueAccessor {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _fileInput =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private _matDialog = inject(MatDialog);
  private _defaultOptions = inject(FILE_UPLOAD_OPTIONS);

  /**
   * Determines if multiple file selection is allowed.
   * Default is `true`.
   *
   * @REFERNCE https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/multiple
   */
  multiple = input<boolean, BooleanInput>(true, {
    transform: coerceBooleanProperty,
  });

  /**
   * Accepted file types for upload.
   *
   * @REFERENCE https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept
   */
  accept = input<string>('*');

  /** Whether ignore the duplicate uploaded files */
  ignoreDuplicates = input<boolean, BooleanInput>(
    this._defaultOptions.ignoreDuplicate,
    { transform: coerceBooleanProperty }
  );

  private _disabled = false;
  /** Whether the file upload is disabled. */
  @Input({ transform: coerceBooleanProperty })
  set disabled(value: boolean) {
    this._disabled = value;
  }
  get disabled(): boolean {
    return this._disabled;
  }

  /** The current value of the file upload. */
  @Input()
  get value() {
    return this._value;
  }
  set value(value: FileValue) {
    this.writeValue(value);
  }
  private _value: File[] | File | undefined | null;

  /** Event emitted when invalid files (not accepted) are detected. */
  invalidFormat = output<File[]>();

  /** Event emitted when duplicate files are detected. */
  duplicate = output<File[]>();

  /** Event emitted when no file is selected. */
  noFileSelected = output<void>();

  /** Event emitted whenever the value changes. */
  valueChange = output<FileValue>();

  /**
   * Event emitted whenever the user does not change their selection, reselecting the previously selected files.
   * The cancel event is also fired when the file picker dialog gets closed, or canceled, via the `cancel` button or the `escape` key
   * */
  cancel = output<void>();

  /** Callback registered via ControlValueAccessor to notify form value changes. */
  _onChange: (value: FileValue) => void = () => {};

  /** Callback registered via ControlValueAccessor to notify when the component is touched. */
  _onTouched: () => void = () => {};

  constructor() {
    const ngControl = inject(NgControl, { optional: true });

    if (ngControl) ngControl.valueAccessor = this;
  }

  writeValue(value: FileValue): void {
    const files = this.fileValueToArray(value);
    if (this.multiple()) this._value = files;
    else this._value = files[0];
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._renderer.setProperty(
      this._elementRef.nativeElement,
      'disabled',
      isDisabled
    );

    this.disabled = isDisabled;
  }

  /** Handles files pasted from clipboard. */
  _setValueOnPaste(event: ClipboardEvent) {
    if (this.disabled) return;

    const files = Array.from(event.clipboardData?.files || []).map((file) =>
      DEFAULT_SCREENSHOT_IMAGE_NAMES.includes(file.name)
        ? this.renameFile(file, `${new Date().getTime()}.png`)
        : file
    );

    this._setValue(files);
  }

  /** Handles files dropped via drag-and-drop. */
  _setValueOnDrop(event: DragEvent) {
    // To prevent opening file by browser
    event.preventDefault();

    if (this.disabled) return;

    const fileList = event.dataTransfer?.files;
    this._setValue(fileList);
  }

  /** Opens the hidden file input dialog. */
  _openDialog() {
    if (!this.disabled) {
      this._fileInput().nativeElement.click();
    }
  }

  /** Core method to set value programmatically or from user input. */
  _setValue(value: FileValue) {
    if (
      // For null & undefined check
      !value ||
      // For FileList & File[] check
      (!(value instanceof File) && value.length < 1)
    )
      return this.noFileSelected.emit();

    if (this.multiple()) {
      const files = this.fileValueToArray(value);

      this.setMultiFiles(files);
    } else this.setSingleFile(Array.from(value as FileList)[0]);
  }

  private setSingleFile(file: File) {
    if (!this.isAcceptable(file)) return this.invalidFormat.emit([file]);

    this._value = file;

    this._onChange(this.value);
    this.valueChange.emit(this.value);
  }

  private setMultiFiles(files: File[]) {
    const [acceptedFiles, rejectedFiles] = this.splitFiles(
      files,
      this.isAcceptable
    );

    if (rejectedFiles.length) this.invalidFormat.emit(rejectedFiles);

    if (!acceptedFiles.length) return;

    if (!Array.isArray(this._value)) this._value = [];

    const [duplicatedFiles, newFiles] = this.splitFiles(
      acceptedFiles,
      (file: File) =>
        (this.value as File[]).some(
          (existingFile) => existingFile.name === file.name
        )
    );

    if (newFiles.length) this._value.push(...newFiles);

    const finalize = () => {
      this._onChange(this.value);
      this.valueChange.emit(this.value);
    };

    if (duplicatedFiles.length) {
      this.duplicate.emit(duplicatedFiles);

      if (!this.ignoreDuplicates()) {
        this.openOptionDialog(duplicatedFiles).subscribe((result) => {
          if (result === 'keep') this.setDuplicateFiles(duplicatedFiles);
          else if (result === 'replace')
            this.setReplacementFiles(duplicatedFiles);

          finalize();
        });

        return;
      }
    }

    finalize();
  }

  private isAcceptable = (file: File): boolean => {
    const acceptStr = this.accept().trim();

    if (!acceptStr || acceptStr === '*' || acceptStr === '') return true;

    const acceptList = acceptStr
      .split(',')
      .map((type) => type.trim().toLowerCase());

    return acceptList.some((type) => {
      if (type === '*') return true;

      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      }

      if (type.endsWith('/*')) {
        const mainType = type.split('/')[0];
        return file.type.toLowerCase().startsWith(mainType + '/');
      }

      return file.type.toLowerCase() === type;
    });
  };

  private splitFiles(
    files: File[],
    splitFn: (file: File) => boolean
  ): // [Truthy files[], Falsy files[]]
  [File[], File[]] {
    return files.reduce(
      (splitedFiles, file) => {
        if (splitFn(file)) {
          splitedFiles[0].push(file);
        } else {
          splitedFiles[1].push(file);
        }
        return splitedFiles;
      },
      [[], []] as [File[], File[]]
    );
  }

  private fileValueToArray(value: FileValue): File[] {
    return value instanceof FileList
      ? Array.from(value)
      : ([value].flat().filter(Boolean) as File[]);
  }

  private openOptionDialog(
    files: File[]
  ): Observable<DFileUploadOptionResult | undefined> {
    return this._matDialog
      .open<DFileUploadOptionDialog, any, DFileUploadOptionResult | undefined>(
        DFileUploadOptionDialog,
        {
          disableClose: true,
          data: { files },
        }
      )
      .afterClosed();
  }

  private setDuplicateFiles(files: File[]) {
    const map = new Map<string, File[]>();
    const currentFiles = this.value as File[];

    currentFiles.forEach((file) => {
      const baseName = this.getBaseName(file);

      if (!map.has(baseName)) {
        map.set(baseName, []);
      }

      map.get(baseName)!.push(file);
    });

    files.forEach((file) => {
      const baseName = this.getBaseName(file);
      const duplicates = map.get(baseName);

      if (duplicates?.length) {
        // Split name and extension
        const match = baseName.match(/^(.*?)(\.[^.]+)?$/);
        const nameWithoutExt = match?.[1] ?? baseName;
        const ext = match?.[2] ?? '';

        currentFiles.push(
          this.renameFile(
            file,
            `${nameWithoutExt} (${duplicates.length})${ext}`
          )
        );
      } else currentFiles.push(file);
    });
  }

  private setReplacementFiles(files: File[]) {
    files.forEach((file) => {
      const currentFiles = this.value as File[];
      const index = currentFiles.findIndex(
        (existingFile) => existingFile.name === file.name
      );

      if (index > -1) currentFiles[index] = file;
    });
  }

  private renameFile(file: File, newName: string): File {
    return new File([file], newName, { type: file.type });
  }

  private getBaseName(file: File): string {
    return file.name.replace(/\s?\(\d+\)(?=\.[^.]+$)/, '');
  }
}

@Component({
  selector: 'd-file-upload-option-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatRadioModule,
    FormsModule,
    MatButtonModule,
    MarkdownComponent,
  ],
  template: `
    <h2 mat-dialog-title [class]="titleClassList">{{ title }}</h2>

    <mat-dialog-content>
      <markdown>{{ message }}</markdown>

      <div>
        <mat-radio-group
          class="d-file-upload-option-dialog-radio-group"
          [(ngModel)]="selectedValue"
        >
          <mat-radio-button value="replace">
            {{ replaceOptionLabel }}
          </mat-radio-button>

          <mat-radio-button value="keep">
            {{ keepOptionLabel }}
          </mat-radio-button>
        </mat-radio-group>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button matButton mat-dialog-close>
        {{ buttonCancelLabel }}
      </button>

      <button matButton="filled" [mat-dialog-close]="selectedValue">
        {{ buttonUploadLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .d-file-upload-option-dialog-radio-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 4px;
      }
    `,
  ],
  providers: [provideMarkdown()],
})
class DFileUploadOptionDialog {
  readonly message: string;
  readonly buttonCancelLabel: string;
  readonly buttonUploadLabel: string;
  readonly titleClassList: string;
  readonly title: string;
  readonly replaceOptionLabel: string;
  readonly keepOptionLabel: string;

  selectedValue: DFileUploadOptionResult;

  constructor() {
    const options = inject(FILE_UPLOAD_OPTIONS);
    this.selectedValue = options.defaultUploadOption;
    this.titleClassList = options.uploadOptionsDialogTitleClass || '';

    const intl = inject(FILE_UPLOAD_INTL);
    this.title = intl.uploadOptionsDialogTitle;
    this.replaceOptionLabel = intl.replaceOptionLabel;
    this.keepOptionLabel = intl.keepOptionLabel;
    this.buttonCancelLabel = intl.buttonCancelLabel;
    this.buttonUploadLabel = intl.buttonUploadLabel;

    const data = inject<{ files: File[] }>(MAT_DIALOG_DATA);

    this.message = intl.uploadOptionsDialogContentMessage(data.files);
  }
}
