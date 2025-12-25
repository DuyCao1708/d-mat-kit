import { SortDirection, SortHeaderArrowPosition } from '@angular/material/sort';

/**
 * Defines the structure and behavior of a column in {@link DTable}.
 *
 * @template T The type of each row item.
 */
export type DColumn<T = unknown> = {
  /** Unique identifier for the column, used for bindings and templates */
  name: string;
  /** Text label that should be used for the column header */
  header?: string;
  /**
   * Accessor function to retrieve the data rendered for each cell.
   * If this property is not set, the data cells will render the value found in the data's property matching the column's name.
   * For example, if the column is named id, then the rendered value will be value defined by the data's id property.
   * Supports nested properties using dot notation (e.g., `user.name.first`).
   * @param data The row data used to render the cell.
   * @returns The value to render as a string.
   */
  dataAccessor?: (data: T, name: string) => string;
  /** Alignment of the cell values. */
  justify?: 'start' | 'end' | 'center';
  /** Enables sorting for this column if true or provides with sort options */
  sort?: Partial<DSortHeader> | boolean;
  /** Whether the cell is sticky */
  sticky?: boolean;
  /** Whether this column should be sticky positioned on the end of the row */
  stickyEnd?: boolean;
};

export type DSortHeader = {
  /** Sets the position of the arrow that displays when sorted */
  arrowPosition: SortHeaderArrowPosition;
  /** Overrides the disable clear value of the containing MatSort for this MatSortable */
  disableClear: boolean;
  /** Whether the sort header is disabled. */
  disabled: boolean;
  /** ID of this sort header */
  id: string;
  /**
   * Description applied to MatSortHeader's button element with aria-describedby.
   * This text should describe the action that will occur when the user clicks the sort header
   */
  sortActionDescription: string;
  /** Overrides the sort start value of the containing MatSort for this MatSortable */
  start: SortDirection;
};

/**
 * Provides contextual information for a table cell during rendering.
 *
 * Useful for conditionally formatting or computing cell values, classes, styles, etc based on
 * row position, index, or other runtime characteristics.
 *
 * @template T The type of each row item.
 */
export type DCellContext<T = unknown> = {
  /** Data for the row that this cell is located within. */
  $implicit: T;
  /** Index of the data object in the provided data array. */
  dataIndex: number;
  /** The index of the item in the currently rendered list */
  renderIndex: number;
  /** True if this cell is contained in the first row. */
  first: boolean;
  /** True if this cell is contained in the last row. */
  last: boolean;
  /** True if this cell is contained in a row with an even-numbered index. */
  even: boolean;
  /** True if this cell is contained in a row with an odd-numbered index. */
  odd: boolean;
};

/**
 * Represents a value that can be rendered in a cell or column, which may vary
 * depending on the rendering context.
 */
export class ContextualValue<T = unknown> {
  private readonly _expressions;

  constructor(
    expressions:
      | string
      | string[]
      | number
      | ((context: DCellContext<T>) => string | number)
      | (string | ((context: DCellContext<T>) => string | number))[]
  ) {
    this._expressions = [expressions]
      .flat()
      .filter((exp) => Boolean(exp) || exp === 0);
  }

  /** Compute value from expressions by the context */
  getValueByContext(context: DCellContext<T>): string | number {
    return this._expressions
      .map((expr) => (typeof expr === 'function' ? expr(context) : expr))
      .join(' ');
  }
}

//** Css value for cell text alignment */
export type DCellJustify = 'start' | 'end' | 'center';

/** Provides default options for table to render a given column {@link DColumn} */
export type DTableColumnOptions = {
  /**
   * Accessor function to retrieve the data rendered for each cell.
   * If this property is not set, the data cells will render the value found in the data's property matching the column's name.
   * For example, if the column is named id, then the rendered value will be value defined by the data's id property.
   * Supports nested properties using dot notation (e.g., `user.name.first`).
   * @param data The row data used to render the cell.
   * @param name The column name.
   * @returns The value to render as a string.
   */
  dataAccessor: (data: any, name: string) => string;
  /** Alignment of the cell values. */
  justify: DCellJustify;
  /** Default sort options. The `id` property can be leave empty, it will be overridened by column name by default */
  sort: DSortHeader;
};

/** Provides default options for table to render an expandable row */
export type DTableExpandableRowOptions = {
  /** Whether the expandable row content should stick and resize on table width changes */
  sticky: boolean;
  /** Name of only column in the expandable row */
  columnName: string;
};

/** Provides default options to render a table */
export type DTableOptions = {
  /** Whether the default header row is sticky */
  stickyDefaultHeaderRow: boolean;
  /** Whether the only data row in table should be expanded automatically */
  expandIfSingleRow: boolean;
  /** Whether use default no data row or not */
  useDefaultNoDataRow: boolean;
  /** Table column default options */
  column: DTableColumnOptions;
  /** Table expandable default row options */
  expandableRow: DTableExpandableRowOptions;
};

/** Referenced from {@link DTableOptions} */
export type PartialDTableOptions = Partial<{
  /** Referenced from {@link DTableOptions} */
  stickyDefaultHeaderRow: boolean;
  /** Referenced from {@link DTableOptions} */
  column: Partial<DTableColumnOptions>;
  /** Referenced from {@link DTableOptions} */
  expandableRow: Partial<DTableExpandableRowOptions>;
}>;

/**
 * Internationalization (i18n) labels used by the table components.
 */
export type DTableIntl = {
  /** Default string displayed when there is no matching data in the table. */
  noDataRow: string;
};

export * from './table-options';
