import {
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  signal,
  TemplateRef,
} from '@angular/core';
import { ContextualValue, DCellContext, DCellJustify } from '../../models';
import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';

/**
 * Represents the common interface for defining cell-related metadata within the {@link DTable} component.
 * @template T - The type of data represented in the table row context.
 */
interface DTableCellDef<T = unknown> {
  /** The name of the column that this cell belongs to. */
  columnName: InputSignal<string>;
  /** The `TemplateRef` that contains the template used to render the contents of the cell. */
  template: TemplateRef<any>;
  /** Cell's colspan attribute value */
  colspan: Signal<number | ContextualValue<T> | undefined>;
  /** Cell's rowspan attribute value */
  rowspan: Signal<number | ContextualValue<T> | undefined>;
  /** Cell's class attribute value */
  classList: Signal<string | ContextualValue<T> | undefined>;
  /** Cell's text alignment */
  justify: Signal<DCellJustify | ContextualValue<T> | undefined>;
}

/** Indicates the cell can be configured to "stick" to the start or end of a table when scrolling. */
export interface CanStickCell {
  /** Whether the cell is sticky. */
  sticky: Signal<boolean | undefined>;
  /** Whether this column should be sticky positioned on the end of the row. */
  stickyEnd: Signal<boolean | undefined>;
}

/** Abstract class for cell definition directives that use static (non-contextual) inputs. */
export abstract class DStaticInputsCellDef implements DTableCellDef<never> {
  abstract columnName: InputSignal<string>;

  template = inject(TemplateRef<never>) as TemplateRef<never>;

  get classList() {
    return computed(() => this._cell()?.classList());
  }

  get colspan() {
    return computed(() => this._cell()?.colspan());
  }

  get rowspan() {
    return computed(() => this._cell()?.rowspan());
  }

  get justify() {
    return computed(() => this._cell()?.justify());
  }

  protected _cell = signal<DStaticInputsCell | undefined>(undefined);

  /** @docs-private */
  _registerCell(cell: DStaticInputsCell): void {
    this._cell.set(cell);
  }
}

/** Abstract class cell directives that use static (non-contextual) inputs. */
@Directive()
abstract class DStaticInputsCell {
  /** Cell's class attribute value */
  abstract classList: InputSignalWithTransform<
    string | undefined,
    string | string[]
  >;

  /** Cell's colspan attribute value */
  colspan = input<number, number | string>(undefined, {
    transform: (v: string | number | undefined) => coerceNumberProperty(v),
  });

  /** Cell's rowspan attribute value */
  rowspan = input<number, number | string>(undefined, {
    transform: (v: string | number | undefined) => coerceNumberProperty(v),
  });

  /** Cell's text alignment */
  justify = input<DCellJustify>();
}

/**
 * Cell definition for a `DTable`.
 * Captures the template of a cell's data as well as computes cell-specific properties.
 */
@Directive({
  selector: '[dCellDef]',
})
export class DCellDef<T = unknown> implements DTableCellDef<T> {
  columnName = input.required<string>({ alias: 'dCellDef' });

  template = inject(TemplateRef<DCellContext<T>>);

  get classList() {
    return computed(() => this._cell()?.classList());
  }

  get colspan() {
    return computed(() => this._cell()?.colspan());
  }

  get rowspan() {
    return computed(() => this._cell()?.rowspan());
  }

  get justify() {
    return computed(() => this._cell()?.justify());
  }

  private _cell = signal<DCell<T> | null>(null);

  /** @docs-private */
  _registerCell(cell: DCell<T>): void {
    this._cell.set(cell);
  }
}

/**
 * Base class for the cell. Captures cell properties.
 *
 * @NOTE {@link ContextualValue} should be used for `classList`, `colspan`, `rowspan` or `justify`
 * when their values need to be rendered differently per row.
 *
 * Since `DCell` is reused for every column cell in each row, the value set in one row
 * may override or affect others if it's shared or static.
 *
 * To avoid this, wrap the value in a `ContextualValue` instance with a predicate function
 * that returns the correct value based on the row context.
 *
 * Example:
 * ### Usage in template:
 * ```html
 * <ng-container
 *   d-cell
 *   *dCellDef="'id'; let row"
 *   [rowspan]="cellColspan"
 *   >{{ row.id }}</ng-container
 *  >
 * ```
 *
 * ### Usage in component:
 * ```ts
 * cellColspan = new ContextualValue<{ id: number }>((context) => context.$implicit.code === 1 ? 2 : 1);
 * ```
 */
@Directive({
  selector: '[d-cell]',
})
export class DCell<T = unknown> {
  classList = input<ContextualValue<T>, string | string[] | ContextualValue<any>>(
    undefined,
    {
      alias: 'tdClass',
      transform: (
        value: string | string[] | ContextualValue<any> | undefined
      ) => {
        if (value === undefined) return;

        if (value instanceof ContextualValue) return value;

        const values = [value].flat().filter(Boolean);

        return new ContextualValue(values);
      },
    }
  );

  colspan = input<ContextualValue<T>, number | string | ContextualValue<any>>(
    undefined,
    {
      transform: (value: number | string | ContextualValue | undefined) => {
        if (value === undefined) return;

        if (value instanceof ContextualValue) return value;

        return new ContextualValue(value);
      },
    }
  );

  rowspan = input<ContextualValue<T>, number | string | ContextualValue<any>>(
    undefined,
    {
      transform: (value: number | string | ContextualValue | undefined) => {
        if (value === undefined) return;

        if (value instanceof ContextualValue) return value;

        return new ContextualValue(value);
      },
    }
  );

  justify = input<ContextualValue<T>, DCellJustify | ContextualValue<any>>(
    undefined,
    {
      transform: (value: DCellJustify | ContextualValue | undefined) => {
        if (value === undefined) return;

        if (value instanceof ContextualValue) return value;

        return new ContextualValue(value);
      },
    }
  );

  constructor() {
    const cellDef = inject(DCellDef<T>, {
      host: true,
    });

    cellDef._registerCell(this);
  }
}

/**
 * Header cell definition for a `DTable`.
 * Captures the template of a header cell's data as well as computes cell-specific properties.
 */
@Directive({
  selector: '[dHeaderCellDef]',
})
export class DHeaderCellDef extends DStaticInputsCellDef {
  columnName = input.required<string>({ alias: 'dHeaderCellDef' });
}

/** Base class for the header cell. Captures cell properties. */
@Directive({
  selector: '[d-header-cell]',
})
export class DHeaderCell extends DStaticInputsCell {
  classList = input<string, string | string[]>(undefined, {
    alias: 'thClass',
    transform: (value: string | string[] | undefined) =>
      [value].flat().filter(Boolean).join(' '),
  });

  constructor() {
    super();
    inject(DHeaderCellDef, { host: true })._registerCell(this);
  }
}

/**
 * Footer cell definition for a `DTable`.
 * Captures the template of a footer cell's data as well as computes cell-specific properties.
 *
 * Specifies which column should render a footer cell. Columns without an explicit definition will render empty cells in the footer row.
 */
@Directive({
  selector: '[dFooterCellDef]',
})
export class DFooterCellDef extends DStaticInputsCellDef {
  columnName = input.required<string>({ alias: 'dFooterCellDef' });

  get sticky() {
    return computed(() => (this._cell() as CanStickCell | undefined)?.sticky());
  }

  get stickyEnd() {
    return computed(() =>
      (this._cell() as CanStickCell | undefined)?.stickyEnd()
    );
  }
}

/** Base class for the footer cell. Captures cell properties. */
@Directive({
  selector: '[d-footer-cell]',
})
export class DFooterCell extends DStaticInputsCell {
  classList = input<string, string | string[]>(undefined, {
    alias: 'tdClass',
    transform: (value: string | string[] | undefined) =>
      [value].flat().filter(Boolean).join(' '),
  });

  sticky = input<boolean, boolean | string>(undefined, {
    transform: (value: boolean | string | undefined) =>
      value === undefined ? undefined : coerceBooleanProperty(value),
  });

  stickyEnd = input<boolean, boolean | string>(undefined, {
    transform: (value: boolean | string | undefined) =>
      value === undefined ? undefined : coerceBooleanProperty(value),
  });

  constructor() {
    super();
    inject(DFooterCellDef, { host: true })._registerCell(this);
  }
}

/**
 * Alternative header (a header below the default one) cell definition for a `DTable`.
 * Captures the template of a alternative header cell's data as well as computes cell-specific properties.
 *
 * Specifies which column should render a alternative header cell. Columns without an explicit definition will render empty cells in the alternative header row.
 */
@Directive({
  selector: '[dAltHeaderCellDef]',
})
export class DAltHeaderCellDef
  extends DStaticInputsCellDef
  implements CanStickCell
{
  columnName = input.required<string>({ alias: 'dAltHeaderCellDef' });

  get sticky() {
    return computed(() => (this._cell() as CanStickCell | undefined)?.sticky());
  }

  get stickyEnd() {
    return computed(() =>
      (this._cell() as CanStickCell | undefined)?.stickyEnd()
    );
  }
}

/** Base class for the alternative header cell. Captures cell properties. */
@Directive({
  selector: '[d-alt-header-cell]',
})
export class DAltHeaderCell extends DStaticInputsCell implements CanStickCell {
  classList = input<string, string | string[]>(undefined, {
    alias: 'thClass',
    transform: (value: string | string[] | undefined) =>
      [value].flat().filter(Boolean).join(' '),
  });

  sticky = input<boolean, boolean | string>(undefined, {
    transform: (value: boolean | string | undefined) =>
      value === undefined ? undefined : coerceBooleanProperty(value),
  });

  stickyEnd = input<boolean, boolean | string>(undefined, {
    transform: (value: boolean | string | undefined) =>
      value === undefined ? undefined : coerceBooleanProperty(value),
  });

  constructor() {
    super();
    inject(DAltHeaderCellDef, { host: true })._registerCell(this);
  }
}
