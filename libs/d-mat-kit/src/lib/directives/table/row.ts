import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  contentChildren,
  Directive,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import {
  CanStickCell,
  DAltHeaderCellDef,
  DFooterCellDef,
  DStaticInputsCellDef,
} from './cell';

/**
 * Abstract base class for table row definitions such as footer and alternative header rows.
 *
 * @T A type extending both {@link DStaticInputsCellDef} and {@link CanStickCell},
 * representing the kind of cell definitions this row contains.
 */
@Directive()
export abstract class DRow<T extends DStaticInputsCellDef & CanStickCell> {
  /** Name of the row. */
  abstract rowName: InputSignal<string>;

  /** Whether the row is sticky. */
  abstract sticky: InputSignalWithTransform<boolean, string | boolean>;

  /** The list of cell definitions within this row content. */
  abstract contentCellDefs: Signal<readonly T[]>;

  ngAfterContentInit(): void {
    this.checkAnyDefinedColumns();
    this.checkDuplicateColumns();
  }

  private checkDuplicateColumns() {
    const cellDefs = this.contentCellDefs();
    const cellDefsMap = new Map<string, T[]>();

    for (const cellDef of cellDefs) {
      const name = cellDef.columnName();

      if (!cellDefsMap.has(name)) cellDefsMap.set(name, []);

      if (name) {
        cellDefsMap.get(name)!.push(cellDef);
      }
    }

    const duplicates = Array.from(cellDefsMap.entries())
      .filter(([_, cellDefs]) => cellDefs.length > 1)
      .map(([name]) => name);

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate column definition names provided: ${duplicates
          .map((name) => `"${name}"`)
          .join(', ')}`
      );
    }
  }

  private checkAnyDefinedColumns() {
    if (!this.contentCellDefs().length)
      throw new Error(
        `No column definitions found in row name provided: ${this.rowName()}`
      );
  }
}

/** Directive used to define an alternative header row in the `DTable`. */
@Directive({ selector: '[dAltHeaderRow]' })
export class DAltHeaderRow extends DRow<DAltHeaderCellDef> {
  rowName = input.required<string>({ alias: 'dAltHeaderRow' });

  sticky = input<boolean, boolean | string>(false, {
    transform: (value: string | boolean) => coerceBooleanProperty(value),
  });

  contentCellDefs = contentChildren(DAltHeaderCellDef);
}

/** Directive used to define an footer row in the `DTable`. */
@Directive({ selector: '[dFooterRow]' })
export class DFooterRow extends DRow<DFooterCellDef> {
  rowName = input.required<string>({ alias: 'dFooterRow' });

  sticky = input<boolean, boolean | string>(false, {
    transform: (value: string | boolean) => coerceBooleanProperty(value),
  });

  contentCellDefs = contentChildren(DFooterCellDef);
}
