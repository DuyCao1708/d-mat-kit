import { TemplateRef } from '@angular/core';
import {
  DHeaderCellDef,
  DCellDef,
  DStaticInputsCellDef,
  DAltHeaderCellDef,
  DFooterCellDef,
  CanStickCell,
  DAltHeaderRow,
  DFooterRow,
  DRow,
} from '../../directives';
import {
  ContextualValue,
  DCellJustify,
  DColumn,
  DSortHeader,
  DTableColumnOptions,
} from '.';

/** @docs-private */
interface DTableCellOptions<T = unknown> {
  template?: TemplateRef<any> | null;
  justify: DCellJustify | ContextualValue<T>;
  colspan: number | ContextualValue<T>;
  rowspan: number | ContextualValue<T>;
  classList: string | ContextualValue<T>;
}

/** @docs-private */
class DHeaderCellOptions implements DTableCellOptions<never> {
  displayText?: string;
  sort: DSortHeader;
  template: TemplateRef<never> | null = null;
  justify: DCellJustify;
  colspan: number = 1;
  rowspan: number = 1;
  classList: string = '';

  constructor(
    defaultOptions: DTableColumnOptions,
    headerCellDef: DHeaderCellDef,
    justify?: DCellJustify,
    sort?: Partial<DSortHeader> | boolean
  );
  constructor(
    defaultOptions: DTableColumnOptions,
    name?: string,
    justify?: DCellJustify,
    sort?: Partial<DSortHeader> | boolean
  );

  constructor(defaultOptions: DTableColumnOptions, ...args: any[]) {
    const definedJustify = args[1] as DCellJustify | undefined;
    this.justify = definedJustify || defaultOptions.justify;
    /** @NOTE Must clone this options because DTableColumnOptions is singleton */
    this.sort = { ...defaultOptions.sort };

    if (typeof args[0] === 'string' || args[0] === undefined) {
      this.displayText = args[0] || '';
    } else {
      const headerCellDef = args[0] as DHeaderCellDef;

      this.template = headerCellDef.template;

      const headerCellJustify = headerCellDef.justify();
      if (headerCellJustify) this.justify = headerCellJustify;

      this.colspan = headerCellDef.colspan() ?? 1;
      this.rowspan = headerCellDef.colspan() ?? 1;
      this.classList = headerCellDef.classList() || '';
    }

    const sort = args[2] as Partial<DSortHeader> | boolean | undefined;

    if (typeof sort === 'boolean') {
      this.sort.disabled = !sort;
    } else if (sort && typeof sort === 'object') {
      this.sort.disabled = false;

      this.sort = {
        ...this.sort,
        ...sort,
      };
    }

    if (!this.sort.disabled) {
      this.classList += `d-table-header-sortable-header-justify-${this.justify}`;
    }
  }
}

/** @docs-private */
class DCellOptions<T = unknown> implements DTableCellOptions<T> {
  template: TemplateRef<any> | null = null;
  dataAccessor?: (data: T, name: string) => string;
  justify: ContextualValue<T>;
  colspan: ContextualValue<T> = new ContextualValue(1);
  rowspan: ContextualValue<T> = new ContextualValue(1);
  classList: ContextualValue<T> = new ContextualValue('');

  constructor(
    defaultOptions: DTableColumnOptions,
    dataAccessor?: (data: T, name: string) => string,
    justify?: DCellJustify
  );
  constructor(
    defaultOptions: DTableColumnOptions,
    cellDef: DCellDef<T>,
    justify?: DCellJustify
  );

  constructor(defaultOptions: DTableColumnOptions, ...args: any[]) {
    const definedJustify = args[1] as DCellJustify | undefined;
    this.justify = new ContextualValue(
      definedJustify || defaultOptions.justify
    );

    if (typeof args[0] === 'object') {
      const cellDef = args[0] as DCellDef;

      this.template = cellDef.template;

      const cellJustify = cellDef.justify();
      if (cellJustify) this.justify = cellJustify;

      this.colspan = cellDef.colspan() || new ContextualValue(1);
      this.rowspan = cellDef.colspan() || new ContextualValue(1);
      this.classList = cellDef.classList() || new ContextualValue('');
    } else {
      this.dataAccessor =
        args[0] ||
        (defaultOptions.dataAccessor as (data: T, name: string) => string);
    }
  }
}

/** @docs-private */
abstract class DRowCellOptions<T extends DStaticInputsCellDef & CanStickCell>
  implements DTableCellOptions<never>
{
  template: TemplateRef<never> | null = null;
  justify: DCellJustify;
  colspan: number = 1;
  rowspan: number = 1;
  classList: string = '';
  sticky: boolean = false;
  stickyEnd: boolean = false;

  protected _columnName: string;
  protected _rowName: string;
  abstract get columnName(): string;

  constructor(
    defaultOptions: DTableColumnOptions,
    rowName: string,
    columnOptions: DColumnOptions<any>,
    cellDef?: T
  ) {
    this.justify = columnOptions.justify || defaultOptions.justify;
    this._rowName = rowName;
    this._columnName = columnOptions.name;
    this.sticky = columnOptions.sticky;
    this.stickyEnd = columnOptions.stickyEnd;

    if (cellDef) {
      this.template = cellDef.template;
      this.colspan = cellDef.colspan() ?? 1;
      this.rowspan = cellDef.rowspan() ?? 1;
      this.classList = cellDef.classList() || '';

      const cellJustify = cellDef.justify();
      if (cellJustify !== undefined) this.justify = cellJustify;

      const cellDefSticky = cellDef.sticky();
      if (cellDefSticky !== undefined) this.sticky = cellDefSticky;

      const cellDefStickyEnd = cellDef.stickyEnd();
      if (cellDefStickyEnd !== undefined) this.stickyEnd = cellDefStickyEnd;
    }
  }
}

/** @docs-private */
class DAltHeaderCellOptions extends DRowCellOptions<DAltHeaderCellDef> {
  get columnName() {
    return `d-alt-header-cell_${this._rowName}_${this._columnName}`;
  }
}

/** @docs-private */
class DFooterCellOptions extends DRowCellOptions<DFooterCellDef> {
  get columnName() {
    return `d-footer-cell_${this._rowName}_${this._columnName}`;
  }
}

/** @docs-private */
export class DColumnOptions<T> {
  name: string;
  sticky: boolean;
  stickyEnd: boolean;
  justify: DCellJustify;

  headerCell: DHeaderCellOptions;
  cell: DCellOptions<T>;

  get isTemplatesColumn() {
    return this.headerCell.template || this.cell.template;
  }

  constructor(
    defaultOptions: DTableColumnOptions,
    column: DColumn<T>,
    template: { cellDef?: DCellDef<T>; headerCellDef?: DHeaderCellDef }
  ) {
    this.name = column.name;
    this.sticky = !!column.sticky;
    this.stickyEnd = !!column.stickyEnd;
    this.justify = column.justify || defaultOptions.justify;

    if (template.cellDef) {
      this.cell = new DCellOptions(
        defaultOptions,
        template.cellDef,
        column.justify
      );
    } else {
      this.cell = new DCellOptions(
        defaultOptions,
        column.dataAccessor,
        column.justify
      );
    }

    if (template.headerCellDef) {
      this.headerCell = new DHeaderCellOptions(
        defaultOptions,
        template.headerCellDef,
        column.justify,
        column.sort
      );
    } else {
      this.headerCell = new DHeaderCellOptions(
        defaultOptions,
        column.header,
        column.justify,
        column.sort
      );
    }
  }
}

/** @docs-private */
abstract class DRowOptions<T extends DStaticInputsCellDef & CanStickCell> {
  name: string;
  sticky: boolean;

  abstract get columnsNames(): string[];

  constructor(
    row: DRow<T>,
    private readonly CellOptionsCtor: new (
      defaultOptions: DTableColumnOptions,
      rowName: string,
      columnOptions: DColumnOptions<any>,
      cellDef?: T
    ) => DRowCellOptions<T>
  ) {
    this.name = row.rowName();
    this.sticky = row.sticky();
  }

  protected _generateCellsOptions(
    defaultOptions: DTableColumnOptions,
    cellDefs: readonly T[],
    columnOptions: DColumnOptions<any>[]
  ): DRowCellOptions<T>[] {
    const cellDefsMap = new Map<string, T>();

    for (const cellDef of cellDefs) {
      const columnName = cellDef.columnName();

      if (cellDefsMap.has(columnName)) continue;

      cellDefsMap.set(columnName, cellDef);
    }

    const cells = columnOptions.flatMap((column) => {
      const cellDef = cellDefsMap.get(column.name);

      if (!cellDef) {
        return new this.CellOptionsCtor(defaultOptions, this.name, column);
      }

      if (cellDef.colspan() === 0 || cellDef.rowspan() === 0) return [];

      return new this.CellOptionsCtor(
        defaultOptions,
        this.name,
        column,
        cellDef
      );
    });

    return cells;
  }
}

/** @docs-private */
export class DAltHeaderRowOptions extends DRowOptions<DAltHeaderCellDef> {
  altHeaderCells: DAltHeaderCellOptions[];

  get columnsNames() {
    return this.altHeaderCells.map((cell) => cell.columnName);
  }

  constructor(
    defaultOptions: DTableColumnOptions,
    row: DAltHeaderRow,
    columns: DColumnOptions<any>[]
  ) {
    super(row, DAltHeaderCellOptions);

    this.altHeaderCells = this._generateCellsOptions(
      defaultOptions,
      row.contentCellDefs(),
      columns
    );
  }
}

/** @docs-private */
export class DFooterRowOptions extends DRowOptions<DFooterCellDef> {
  footerCells: DFooterCellOptions[];

  get columnsNames() {
    return this.footerCells.map((cell) => cell.columnName);
  }

  constructor(
    defaultOptions: DTableColumnOptions,
    row: DFooterRow,
    columns: DColumnOptions<any>[]
  ) {
    super(row, DFooterCellOptions);

    this.footerCells = this._generateCellsOptions(
      defaultOptions,
      row.contentCellDefs(),
      columns
    );
  }
}
