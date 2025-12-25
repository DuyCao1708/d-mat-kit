# d-mat-kit (Work in Progress)

⚠️ **This library is currently under development. Features may change.**  

A collection of Angular utilities and UI components **built on top of Angular Material** to simplify development and enhance your applications. This library provides **wrappers, services, components, and directives** with extended functionality out of the box. 

## Features

### Table Wrapper
Enhanced table component (based on `MatTable`) with:  
- **Expandable Rows** – easily expand rows to show additional content.
- **Sticky Horizontal Expandable Row** – keep expanded content visible when scrolling.

  ```html
  <d-table
    [columns]="[
      { name: 'column1', header: ' Column 1' },
       ...
    ]"
    [dataSource]="[
      {
        column1: 'This is cell 1 content',
        ...
      }
    ]"
  >
    <div
      *dExpandableRowDef
      style="border: 1px solid #aeaeae; border-radius: 12px; height: 300px; padding: 12px; margin: 12px;"
    >
      Expandable Content
    </div>
  </d-table>
  ```

  ![Expandable Row Demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/sticky-expandable-row.gif)

- **Easy Template Mapping** – automatically maps your templates to the corresponding columns.

  ```html
  <d-table
      [columns]="[
        { name: 'column1', header: ' Column 1' },
        { name: 'column2', header: ' Column 2' },
        { name: 'column3', header: ' Column 3' }
      ]"
      [dataSource]="[
        {
          column1: 'This is cell 1 content',
          column2: 'This is cell 2 content',
          column3: 'This is cell 3 content',
        }
      ]"
    >
      <ng-container *dHeaderCellDef="'column1'">
        Header 1 template
      </ng-container>

      <ng-container dAltHeaderRow="altHeaderRow">
        <ng-container *dAltHeaderCellDef="'column1'">
          Alternative Header 1 template
        </ng-container>
      </ng-container>

      <ng-container *dCellDef="'column1'">
        This is Cell 1 template
      </ng-container>

      <ng-container dFooterRow="footerRow">
        <ng-container *dFooterCellDef="'column1'">
          Footer 1 template
        </ng-container>
      </ng-container>
    </d-table>
  ```

  ![Automapping Demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/automapping-column.png)

### Notification Service
Flexible notification system built on Angular Material components:  
- **Dialog Notifications** – modal-style alerts (`MatDialog`).  
- **Toast Notifications** – non-intrusive, auto-dismissing messages (`MatSnackBar`).

This service **supports Markdown** content via [ngx-markdown](https://github.com/jfcere/ngx-markdown) and uses **animations inspired by [SweetAlert2](https://github.com/sweetalert2/sweetalert2)**

  ```ts
  constructor() {
    inject(DNotification).toast({
      type: 'warn',
      message: `
        # ⚠ Warning!
        **This is a Markdown toast message**
        - Item 1
        - Item 2
      `,
      timeout: 1000,
    });

    inject(DNotification).notify({
      type: 'success',
      message: `
        # ✅ Success!
        **Markdown notification content**
        ### Blockquote
        > This is a blockquote
        `,
    });
   }
  ```

  | Dialog Notification | Toast |
  |-------------------|-------|
  | ![Dialog notification Demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/dialog-notification.png) | ![Toast Demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/toast.png) |


### File Uploader Component

A flexible file uploader component built for Angular, with features to simplify file uploads using **drag & drop**, **paste**, or **file selection**.  

- **Drag & Drop** – drop files anywhere in the upload zone.  
- **Paste files** – paste copied files from clipboard.  
- **File selection** – select files via standard file input.  
- **Reactive Forms support** – bind uploaded files to Angular Reactive Forms.  
- **Server-side upload tracking** – uses a service to monitor upload progress for each file.  

```html
<d-file-upload
  style="width: 100px; background-color: #dcdcdc; padding: 12px;"
  [formControl]="formControl"
>
  <p style="margin-bottom: 4px;">Drag and drop or paste file here</p>

  <button matButton dFileUploadTrigger>Or click here</button>
</d-file-upload>
```

```ts
private _progress = inject(DFileUploadProgress);

formControl = new FormControl<File[] | null>(null);

constructor() {
  const uploadedFiles = new WeakSet<File>();

  this.formControl.valueChanges.subscribe((files) => {
    for (let file of files || []) {
      if (uploadedFiles.has(file)) continue;

      uploadedFiles.add(file);

      const formData = new FormData();
      formData.append('file', file);

      const progress$ = http.post(
          `your-file-upload-api-url`,
          formData,
          {
            reportProgress: true,
            observe: 'events',
          }
        );

        this._progress.track({
          name: file.name,
          type: file.type,
          progress$,
        });
    }
  })
}
```

![File uploader demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/file-uploader.gif)

### Directives
- **Infinite Scroll** – trigger load function for more data when scrolling reaches the end.

  ```html
  <mat-form-field>
      <mat-label>Toppings</mat-label>
      <mat-select multiple [value]="['Option_1']" [dInfiniteScrollLoad]="loadForMore">
        @for(option of options; track option.value ) {
          <mat-option [value]="option.value">{{ option.text }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  ```

  ```ts
  options = Array.from({ length: 100 }).map((_, i) => ({
    value: i,
    text: `Option_${i}`,
  }));
  
  loadForMore = () => {
    this.options = [
      ...this.options.concat(
        ...Array.from({ length: 100 }).map((_, i) => ({
          value: i,
          text: `Option_${this.options.length + i}`,
        }))
      ),
    ];
  };
  ```

  ![Infinite scroll demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/infinite-scroll.gif)
  
- **Swipe Support** – detect swipe gestures for interactive components.

```html
<div
  d-swipeable
  [threshold]="100"
  (swiped)="handleOnSwiped()"
></div>
```
![Swipe demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/swipe.gif)
  
- **Leveraged Menu Trigger** – open Angular Material menus (`MatMenu`) on hover for smoother user interaction.

  ```html
  <button [dMenuTriggerFor]="redMenu" dMenuTriggerHoverable="true" matButton>
    Red trigger
  </button>

  <button [dMenuTriggerFor]="greenMenu" dMenuTriggerHoverable="true" matButton>
    Green trigger
  </button>

  <mat-menu #redMenu>
    <div style="background-color: red; width: 300px; height: 300px"></div>
  </mat-menu>

  <mat-menu #greenMenu>
    <div style="background-color: green; width: 300px; height: 300px"></div>
  </mat-menu>
  ```

  ![Menu trigger demo](https://raw.githubusercontent.com/DuyCao1708/d-mat-kit/refs/heads/develop/apps/d-mat-kit-presentation/public/menu-trigger.gif)

## Configuration

Configure `d-mat-kit` features globally in `app.config.ts` including default options and **i18n**

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideDMatKit(
      withNotification(),
      withTable({
        options: { stickyDefaultHeaderRow: true },
        intl: { noDataRow: 'Không có dữ liệu trong bảng' },
      }),
      withFileUpload()
    ),
  ],
};
```

## Installation

Not ready yet!
