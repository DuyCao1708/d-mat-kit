import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
  TrackByFunction,
  viewChild,
} from '@angular/core';
import {
  DAltHeaderRowOptions,
  DColumnOptions,
  DFooterRowOptions,
} from '../../models/table/table-options';
import {
  MatColumnDef,
  MatFooterRowDef,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRowDef,
  MatTable,
  MatTableModule,
} from '@angular/material/table';
import {
  DAltHeaderRow,
  DExpandableRowDef,
  DFooterRow,
  DHeaderCellDef,
} from '../../directives';
import { NgTemplateOutlet } from '@angular/common';
import { DCellDef } from '../../directives';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TABLE_INTL } from '../../tokens/intl';
import { TABLE_OPTIONS } from '../../tokens/config';
import { DTableExpandableOutlet } from './table-expandable-outlet';
import { Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import {
  ContextualValue,
  DCellContext,
  DCellJustify,
  DColumn,
} from '../../models';

/** Dynamically bind contextual properties like class, colspan, and rowspan based on a table row context.  */
@Directive({
  selector: 'td[dCellContext]',
  host: {
    '[class]': 'hostClassList',
    '[attr.colspan]': 'hostColspan',
    '[attr.rowspan]': 'hostRowspan',
    '[style.display]': 'hostStyleDisplay',
    '[style.text-align]': 'hostStyleTextAlign',
  },
})
export class DCellBinding {
  /** The row context of the table cell. */
  context = input.required<DCellContext>({ alias: 'dCellContext' });

  /** The contextual value of the table cell classes. */
  classList = input.required<
    ContextualValue,
    string | string[] | ContextualValue<any>
  >({
    alias: 'contextualClass',
    transform: (value: string | string[] | ContextualValue) => {
      if (value instanceof ContextualValue) return value;

      const values = [value].flat().filter(Boolean) as string[];

      return new ContextualValue(values);
    },
  });

  /** The contextual value of the table cell colspan. */
  colspan = input.required<
    ContextualValue,
    number | string | ContextualValue<any>
  >({
    alias: 'contextualColspan',
    transform: (value: number | string | ContextualValue) => {
      if (value instanceof ContextualValue) return value;

      return new ContextualValue(value);
    },
  });

  /** The contextual value of the table cell rowpsan. */
  rowspan = input.required<
    ContextualValue,
    number | string | ContextualValue<any>
  >({
    alias: 'contextualRowspan',
    transform: (value: number | string | ContextualValue) => {
      if (value instanceof ContextualValue) return value;

      return new ContextualValue(value);
    },
  });

  /** The contextual value of the table cell justify. */
  justify = input.required<
    ContextualValue,
    DCellJustify | ContextualValue<any>
  >({
    alias: 'contextualJustify',
    transform: (value: DCellJustify | ContextualValue) => {
      if (value instanceof ContextualValue) return value;

      return new ContextualValue(value);
    },
  });

  get hostClassList() {
    return this.classList().getValueByContext(this.context());
  }

  get hostColspan() {
    return this.colspan().getValueByContext(this.context());
  }

  get hostRowspan() {
    return this.rowspan().getValueByContext(this.context());
  }

  get hostStyleDisplay() {
    const colspan = this.colspan().getValueByContext(this.context());
    const rowspan = this.rowspan().getValueByContext(this.context());

    return Number(colspan) === 0 || Number(rowspan) === 0 ? 'none' : '';
  }

  get hostStyleTextAlign() {
    return this.justify().getValueByContext(this.context());
  }
}

/**
 * Wrapper component around Angular Material's `mat-table`.
 * @template T - Type of the data object rendered in the table rows.
 */
@Component({
  selector: 'd-table',
  imports: [
    MatTableModule,
    DCellBinding,
    NgTemplateOutlet,
    MatSortModule,
    DTableExpandableOutlet,
  ],
  template: `
    <table
      mat-table
      [dataSource]="dataSource()"
      [multiTemplateDataRows]="multiTemplateDataRows()"
      [trackBy]="trackBy()"
      (contentChanged)="contentChanged.emit()"
    >
      <ng-content></ng-content>

      <!--#region Default columns definition-->
      @for (column of columnsOptions(); track column.name) {
      <!--prettier-ignore-->
      @let isSortableColumn = isSortable && !column.headerCell.sort.disabled;
      @if (column.isTemplatesColumn || isSortableColumn) {
      <ng-container
        matColumnDef="{{ column.name }}"
        [sticky]="column.sticky"
        [stickyEnd]="column.stickyEnd"
      >
        @if (isSortableColumn) {
        <th
          mat-header-cell
          *matHeaderCellDef
          [class]="column.headerCell.classList"
          [mat-sort-header]="column.headerCell.sort.id"
          [arrowPosition]="column.headerCell.sort.arrowPosition"
          [disableClear]="column.headerCell.sort.disableClear"
          [disabled]="column.headerCell.sort.disabled"
          [sortActionDescription]="column.headerCell.sort.sortActionDescription"
          [start]="column.headerCell.sort.start"
          [attr.colspan]="column.headerCell.colspan"
          [attr.rowspan]="column.headerCell.rowspan"
        >
          <ng-container
            *ngTemplateOutlet="headerContent; context: { $implicit: column }"
          ></ng-container>
        </th>
        } @else {
        <th
          mat-header-cell
          *matHeaderCellDef
          [class]="column.headerCell.classList"
          [style.text-align]="column.headerCell.justify"
          [attr.colspan]="column.headerCell.colspan"
          [attr.rowspan]="column.headerCell.rowspan"
        >
          <ng-container
            *ngTemplateOutlet="headerContent; context: { $implicit: column }"
          ></ng-container>
        </th>
        }

        <td
          mat-cell
          *matCellDef="
            let row;
            dataIndex as dataIndex;
            renderIndex as renderIndex;
            first as first;
            last as last;
            even as even;
            odd as odd
          "
          [dCellContext]="{
            $implicit: row,
            dataIndex,
            renderIndex,
            first,
            last,
            even,
            odd
          }"
          [contextualClass]="column.cell.classList"
          [contextualColspan]="column.cell.colspan"
          [contextualRowspan]="column.cell.rowspan"
          [contextualJustify]="column.cell.justify"
        >
          @if (column.cell.template) {
          <ng-container
            *ngTemplateOutlet="
              column.cell.template;
              context: {
                $implicit: row,
                dataIndex: dataIndex,
                renderIndex: renderIndex,
                last: last,
                first: first,
                even: even,
                odd: odd
              }
            "
          ></ng-container>
          } @else {
          {{ column.cell.dataAccessor?.(row, column.name) }}
          }
        </td>
      </ng-container>
      } @else {
      <mat-text-column
        name="{{ column.name }}"
        [headerText]="column.headerCell.displayText!"
        [dataAccessor]="column.cell.dataAccessor!"
        [justify]="column.headerCell.justify"
      ></mat-text-column>
      } }

      <ng-template #headerContent let-column>
        @if (column.headerCell.template) {
        <ng-container
          *ngTemplateOutlet="column.headerCell.template"
        ></ng-container>
        } @else {
        {{ column.headerCell.displayText }}
        }
      </ng-template>
      <!--#endregion-->

      @if (!hideDefaultHeaderRow()) {
      <tr
        mat-header-row
        *matHeaderRowDef="columnsNames(); sticky: stickyDefaultHeaderRow()"
      ></tr>
      }

      <!--#region Alternative Header Rows-->
      @for (altHeaderRow of altHeaderRowsOptions(); track $index) {
      <!--prettier-ignore-->
      @for (altHeaderCell of altHeaderRow.altHeaderCells; track altHeaderCell.columnName) {
      <ng-container
        matColumnDef="{{ altHeaderCell.columnName }}"
        [sticky]="altHeaderCell.sticky"
        [stickyEnd]="altHeaderCell.stickyEnd"
      >
        <th
          mat-header-cell
          *matHeaderCellDef
          [attr.colspan]="altHeaderCell.colspan"
          [attr.rowspan]="altHeaderCell.rowspan"
          [class]="altHeaderCell.classList"
          [style.text-align]="altHeaderCell.justify"
        >
          <ng-container
            *ngTemplateOutlet="altHeaderCell.template"
          ></ng-container>
        </th>
      </ng-container>
      }

      <tr
        mat-header-row
        *matHeaderRowDef="
          altHeaderRow.columnsNames;
          sticky: altHeaderRow.sticky
        "
        [class]="altHeaderRow.classList"
      ></tr>
      }
      <!--#endregion-->

      <tr
        mat-row
        *matRowDef="let row; columns: columnsNames(); let dataIndex = dataIndex"
        class="d-table-row"
        [class.d-table-row-even-row]="dataIndex % 2"
        [class.d-table-row-odd-row]="!(dataIndex % 2)"
        [class.d-table-row-expanded-row]="isExpanded(row, dataIndex)"
        (click)="toggle(row, dataIndex)"
      ></tr>

      <!--#region Expandable Row-->
      @let _expandableRowDef = expandableRowDef();
      <!--prettier-ignore-->
      @if (_expandableRowDef) {
      @let columnName = _expandableRowDef.columnName();
      <ng-container matColumnDef="{{ columnName }}">
        <td
          mat-cell
          *matCellDef="let row; dataIndex as dataIndex"
          [attr.colspan]="columnsNames().length"
          class="d-table-expandable-cell"
          [class.d-table-expandable-cell-sticky]="_expandableRowDef.sticky()"
          [class]="_expandableRowDef.classList()"
        >
          <div
            class="d-table-expandable-template-wrapper"
            [class.d-table-expandable-template-wrapper-expanded]="
              isExpanded(row, dataIndex)
            "
          >
            <d-table-expandable-outlet
              [expanded]="isExpanded(row, dataIndex)"
              [context]="row"
            ></d-table-expandable-outlet>
          </div>
        </td>
      </ng-container>

      <tr
        mat-row
        *matRowDef="let row; columns: [columnName]"
        class="d-table-expandable-row"
      ></tr>
      }
      <!--#endregion-->

      <!--#region Footer Rows-->
      @for (footerRow of footerRowsOptions(); track $index) {
      <!--prettier-ignore-->
      @for (footerCell of footerRow.footerCells; track footerCell.columnName) {
      <ng-container
        matColumnDef="{{ footerCell.columnName }}"
        [sticky]="footerCell.sticky"
        [stickyEnd]="footerCell.stickyEnd"
      >
        <td
          mat-footer-cell
          *matFooterCellDef
          [attr.colspan]="footerCell.colspan"
          [attr.rowspan]="footerCell.rowspan"
          [class]="footerCell.classList"
          [style.text-align]="footerCell.justify"
        >
          <ng-container *ngTemplateOutlet="footerCell.template"></ng-container>
        </td>
      </ng-container>
      }

      <tr
        mat-footer-row
        *matFooterRowDef="footerRow.columnsNames; sticky: footerRow.sticky"
        [class]="footerRow.classList"
      ></tr>
      }
      <!--#endregion-->

      @if (!hasContentNoDataRow() && this.useDefaultNoDataRow()) {
      <tr *matNoDataRow>
        <td [attr.colspan]="columnsNames().length">
          <p [style.text-align]="'center'" [style.margin]="'12px auto'">
            {{ defaultNoDataRow }}
          </p>
        </td>
      </tr>
      }
    </table>
  `,
  styles: [
    `
      :host {
        display: block;
        overflow: auto;
      }

      .d-table-row:not(.d-table-row-expanded-row) {
        &:hover {
          background: var(--d-table-row-hover-state-color);
        }

        &:active {
          background: var(--d-table-row-focus-state-color);
        }

        &:not(:hover):not(:active).d-table-row-even-row {
          background: var(--d-table-row-even-row-color);
        }

        &:not(:hover):not(:active).d-table-row-odd-row {
          background: var(--d-table-row-odd-row-color);
        }
      }

      .d-table-row-expanded-row {
        background: var(--d-table-row-expanded-row-color);
      }

      .d-table-expandable-row {
        height: 0;
      }

      .d-table-expandable-cell {
        padding-left: 0;
        padding-right: 0;
        border-bottom: 0;
      }

      .d-table-expandable-cell-sticky {
        overflow: visible;
      }

      .d-table-expandable-template-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        grid-template-columns: 100%;
        transition: grid-template-rows 225ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .d-table-expandable-template-wrapper-expanded {
        grid-template-rows: 1fr;
      }
    `,
  ],
  host: {
    '[style.position]': 'hostPositionStyle',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DTable<T = unknown> {
  private readonly _defaultOptions = inject(TABLE_OPTIONS);

  //#region Input, Output Bindings
  /** Defines array of table columns' name. The order of columns will follow the order of items in this array. */
  columns = input.required<DColumn<T>[]>();
  /**
   * The table's source of data, which can be provided in three ways (in order of complexity):
   *   - Simple data array (each object represents one table row)
   *   - Stream that emits a data array each time the array changes
   *   - `DataSource` object that implements the connect/disconnect interface.
   *
   * If a data array is provided, the table must be notified when the array's objects are
   * added, removed, or moved. This can be done by calling the `renderRows()` function which will
   * render the diff since the last table render. If the data array reference is changed, the table
   * will automatically trigger an update to the rows.
   *
   * When providing an Observable stream, the table will trigger an update automatically when the
   * stream emits a new array of data.
   *
   * Finally, when providing a `DataSource` object, the table will use the Observable stream
   * provided by the connect function and trigger updates when that stream emits new data array
   * values. During the table's ngOnDestroy or when the data source is removed from the table, the
   * table will call the DataSource's `disconnect` function (may be useful for cleaning up any
   * subscriptions registered during the connect process).
   */
  dataSource = input.required<
    readonly T[] | DataSource<T> | Observable<readonly T[]>
  >();
  /** Whether the default header row should be hidden */
  hideDefaultHeaderRow = input<boolean, BooleanInput>(false, {
    transform: coerceBooleanProperty,
  });
  /** Whether the default header row is sticky */
  stickyDefaultHeaderRow = input<boolean, BooleanInput>(
    this._defaultOptions.stickyDefaultHeaderRow,
    { transform: coerceBooleanProperty }
  );
  /**
   * Tracking function that will be used to check the differences in data changes.
   * Used similarly to ngFor trackBy function.
   * Optimize row operations by identifying a row based on its data relative to the function to know if a row should be added/removed/moved.
   *
   * Accepts:
   * - A function that takes two parameters, index and item
   * - A key of table row data.
   */
  trackBy = input<TrackByFunction<T>, TrackByFunction<T> | keyof T>(
    (index: number, item: T) => index,
    {
      transform: (value: TrackByFunction<T> | keyof T) => {
        if (typeof value === 'function') return value;

        return (index: number, item: T) => item[value];
      },
    }
  );
  /** Whether the only data row in table should be expanded automatically */
  expandIfSingleRow = input<boolean, BooleanInput>(
    this._defaultOptions.expandIfSingleRow,
    { transform: coerceBooleanProperty }
  );
  /** Whether use default no data row or not */
  useDefaultNoDataRow = input<boolean, BooleanInput>(
    this._defaultOptions.useDefaultNoDataRow,
    { transform: coerceBooleanProperty }
  );

  /** Emits when the table completes rendering a set of data rows based on the latest data from the data source, even if the set of rows is empty. */
  contentChanged = output<void>();
  //#endregion

  //#region ViewChild, ContentChild, ContentChildren and its computations
  //#region Material children
  private readonly _matTable = viewChild.required(MatTable);
  private readonly _matHeaderRowDefs = contentChildren(MatHeaderRowDef);
  private readonly _matRowDefs = contentChildren<MatRowDef<T>>(MatRowDef);
  private readonly _matFooterRowDefs =
    contentChildren<MatFooterRowDef>(MatFooterRowDef);
  private readonly _matNoDataRow = contentChild(MatNoDataRow);
  protected readonly hasContentNoDataRow = computed(
    () => !!this._matNoDataRow()
  );
  private readonly _matColumnDefs = contentChildren(MatColumnDef);
  //#endregion

  private readonly _headerCellDefs = contentChildren(DHeaderCellDef);
  private readonly _altHeaderRows = contentChildren(DAltHeaderRow);
  protected altHeaderRowsOptions = computed(() =>
    this._altHeaderRows().map(
      (row) =>
        new DAltHeaderRowOptions(
          this._defaultOptions.column,
          row,
          this.columnsOptions()
        )
    )
  );
  private readonly _cellDefs = contentChildren(DCellDef);
  private readonly _footerRows = contentChildren(DFooterRow);
  protected footerRowsOptions = computed(() =>
    this._footerRows().map(
      (row) =>
        new DFooterRowOptions(
          this._defaultOptions.column,
          row,
          this.columnsOptions()
        )
    )
  );
  /** Expandable row definition which is defined in `DTable` content */
  readonly expandableRowDef =
    contentChild<DExpandableRowDef<T>>(DExpandableRowDef);
  protected multiTemplateDataRows = computed(
    () => this.expandableRowDef() || this._matRowDefs().length
  );
  //#endregion

  //#region Properties
  private readonly _expandedRowMeta = signal<{ index: number; row: T } | null>(
    null
  );

  protected isSortable = Boolean(
    inject(MatSort, { optional: true, host: true })
  );

  /** */

  /** Displayed columns names computed from the input columns */
  readonly columnsNames = computed(() => this.columns().map((c) => c.name));

  protected columnsOptions = computed(() =>
    this.columns().map((column) => this.generateColumnOptions(column))
  );

  /** Default no data row label shown in table when there is no matching data */
  readonly defaultNoDataRow: string;

  /** This component element ref */
  readonly elementRef = inject(ElementRef);
  //#endregion

  get hostPositionStyle() {
    const hasStickyExpandableRow = this.expandableRowDef()?.sticky;

    return hasStickyExpandableRow ? 'relative' : '';
  }

  constructor() {
    const intl = inject(TABLE_INTL);

    this.defaultNoDataRow = intl.noDataRow;

    this.listenToContentChanged();
  }

  ngAfterContentInit(): void {
    this.checkDuplicateRows(this._altHeaderRows().map((row) => row.rowName()));
    this.checkDuplicateRows(this._footerRows().map((row) => row.rowName()));

    this.registerMaterialTemplates();
  }

  /**
   * Checks whether a row is expanded.
   *
   * @param row - The data object representing the row.
   * @param index - The index of the row in the data source.
   * @returns True if the row is currently expanded, otherwise false.
   */
  isExpanded(row: T, index: number): boolean {
    const expandedRowMeta = this._expandedRowMeta();

    if (!expandedRowMeta) return false;

    const trackBy = this.trackBy();

    return (
      trackBy(index, row) ===
      trackBy(expandedRowMeta.index, expandedRowMeta.row)
    );
  }

  /**
   * Toggles the expanded state of a row.
   *
   * @param row - The data object representing the row.
   * @param index - The index of the row in the data source.
   */
  toggle(row: T, index: number): void {
    if (!this.expandableRowDef()) return;

    this.isExpanded(row, index)
      ? this.collapse(row, index)
      : this.expand(row, index);
  }

  /**
   * Collapses the expanded row.
   *
   * @param row - The data object representing the row.
   * @param index - The index of the row in the data source.
   */
  collapse(row: T, index: number): void {
    if (this.isExpanded(row, index)) {
      this._expandedRowMeta.set(null);
    }
  }

  /**
   * Expands a row if it is collapsed.
   *
   * @param row - The data object representing the row.
   * @param index - The index of the row in the data source.
   */
  expand(row: T, index: number): void {
    if (!this.expandableRowDef()) return;

    if (!this.isExpanded(row, index)) {
      this._expandedRowMeta.set({ row, index });

      const collapseFn = () => this.collapse(row, index);
      this.expandableRowDef()?.expanded.emit(collapseFn);
    }
  }

  /**
   * Renders rows based on the table's latest set of data, which was either provided directly as an input or retrieved through an `Observable` stream (directly or from a `DataSource`).
   *
   * Checks for differences in the data since the last diff to perform only the necessary changes (add/remove/move rows).
   *
   * If the table's data source is a `DataSource` or `Observable`, this will be invoked automatically each time the provided `Observable` stream emits a new data array. Otherwise if your data is an array, this function will need to be called to render any changes.
   */
  renderRows(): void {
    this._matTable().renderRows();
  }

  //#region Private methods
  private registerMaterialTemplates(): void {
    this._matHeaderRowDefs().forEach((headerRowDef) =>
      this._matTable().addHeaderRowDef(headerRowDef)
    );

    this._matRowDefs().forEach((rowDef) => this._matTable().addRowDef(rowDef));

    this._matFooterRowDefs().forEach((footerRowDef) =>
      this._matTable().addFooterRowDef(footerRowDef)
    );

    const matNoDataRow = this._matNoDataRow();
    if (matNoDataRow) this._matTable().setNoDataRow(matNoDataRow);

    this._matColumnDefs().forEach((columnDef) => {
      this._matTable().addColumnDef(columnDef);
    });
  }

  private generateColumnOptions(column: DColumn<T>): DColumnOptions<T> {
    const headerCellDef = this._headerCellDefs().find(
      (def) => def.columnName() === column.name
    );

    const cellDef = this._cellDefs().find(
      (def) => def.columnName() === column.name
    );

    const columnOptions = new DColumnOptions(
      this._defaultOptions.column,
      column,
      { headerCellDef, cellDef }
    );

    return columnOptions;
  }

  private listenToContentChanged(): void {
    this.contentChanged.subscribe(() => {
      this.expandRowIfSingle();
    });
  }

  private expandRowIfSingle(): void {
    const data = (this._matTable() as any)._data;

    if (data.length === 1) {
      this.expand(data[0], 0);
    }
  }

  private checkDuplicateRows(rowNames: string[]) {
    const rowsCountMap = new Map<string, number>();

    for (const name of rowNames) {
      if (name) {
        let count = rowsCountMap.get(name) || 0;
        rowsCountMap.set(name, ++count);
      }
    }

    const duplicates = Array.from(rowsCountMap.entries())
      .filter(([_, count]) => count > 1)
      .map(([name]) => name);

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate row definition names provided: ${duplicates
          .map((name) => `"${name}"`)
          .join(', ')}`
      );
    }
  }
  //#endregion
}
