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
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';

type FileValue = File | File[] | FileList | null | undefined;

type FileCompareFn = (f1: File, f2: File) => boolean;

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
    '(click)': '_openDialog()',
  },
})
export class FileUpload implements ControlValueAccessor {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _fileInput =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  multiple = input<boolean, BooleanInput>(true, {
    transform: coerceBooleanProperty,
  });

  accept = input<string>('*');

  canDuplicate = input<boolean, BooleanInput>(false, {
    transform: coerceBooleanProperty,
  });

  compareWith = input<FileCompareFn>((f1, f2) => f1.name === f2.name);

  private _disabled = false;
  @Input({ transform: coerceBooleanProperty })
  set disabled(value: boolean) {
    this._disabled = value;
  }
  get disabled(): boolean {
    return this._disabled;
  }

  @Input()
  get value() {
    return this._value;
  }
  set value(value: FileValue) {
    this._setValue(value);
  }
  private _value: File[] | File | undefined;

  invalidFormat = output<File[]>();

  duplicate = output<File[]>();

  noFileSelected = output<void>();

  valueChange = output<FileValue>();

  _onChange: (value: FileValue) => void = () => {};
  _onTouched: () => void = () => {};

  private _isWritingValue = false;

  constructor() {
    const ngControl = inject(NgControl, { optional: true });

    if (ngControl) ngControl.valueAccessor = this;
  }

  ngOnInit() {
    if (this.multiple()) {
      this._value = [];
    }
  }

  writeValue(value: FileValue): void {
    // If formControl is reset, instantly set value without emit events
    if (!value || (!(value instanceof File) && value.length < 1)) {
      this._value = this.multiple() ? [] : undefined;
      return;
    }

    this._isWritingValue = true;
    this._setValue(value);
    this._isWritingValue = false;
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

  _setValueOnPaste(event: ClipboardEvent) {
    if (this.disabled) return;

    const files = Array.from(event.clipboardData?.files || []).map((file) => {
      const newFile = new File(
        [file],
        DEFAULT_SCREENSHOT_IMAGE_NAMES.includes(file.name)
          ? `${new Date().getTime()}.png`
          : file.name,
        {
          type: file.type,
        }
      );
      return newFile;
    });

    this._setValue(files);
  }

  _setValueOnDrop(event: DragEvent) {
    // To prevent opening file by browser
    event.preventDefault();

    if (this.disabled) return;

    const fileList = event.dataTransfer?.files;
    this._setValue(fileList);
  }

  _openDialog() {
    if (!this.disabled) {
      this._fileInput().nativeElement.click();
    }
  }

  _setValue(value: FileValue) {
    if (
      // For null & undefined check
      !value ||
      // For FileList & File[] check
      (!(value instanceof File) && value.length < 1)
    )
      return this.noFileSelected.emit();

    if (this.multiple()) {
      const files =
        value instanceof FileList
          ? Array.from(value)
          : [value].flat().filter(Boolean);

      this.setMultiFiles(files);
    } else this.setSingleFile(Array.from(value as FileList)[0]);
  }

  private setSingleFile(file: File) {
    if (!this.isAcceptable(file)) return this.invalidFormat.emit([file]);

    const currentFile = this.value as File | undefined;

    if (currentFile) {
      const isDuplicated = this.compareWith()(file, currentFile);

      if (!this.canDuplicate() && isDuplicated)
        return this.duplicate.emit([file]);
    }

    this._value = file;

    if (!this._isWritingValue) {
      this._onChange(this.value);
      this.valueChange.emit(this.value);
    }
  }

  private setMultiFiles(files: File[]) {
    const [acceptedFiles, rejectedFiles] = this.splitFiles(
      files,
      this.isAcceptable
    );

    if (rejectedFiles.length) this.invalidFormat.emit(rejectedFiles);

    if (!acceptedFiles.length) return;

    const [duplicatedFiles, newFiles] = this.splitFiles(
      acceptedFiles,
      this.compareWith()
    );

    if (duplicatedFiles.length) this.duplicate.emit(duplicatedFiles);

    const value = this.canDuplicate()
      ? duplicatedFiles.concat(newFiles)
      : acceptedFiles;

    this._value = value;

    if (!this._isWritingValue) {
      this._onChange(this.value);
      this.valueChange.emit(this.value);
    }
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
    splitFn: (...args: any[]) => boolean
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
}

const DEFAULT_SCREENSHOT_IMAGE_NAMES = ['image.png', 'ảnh.png'];
