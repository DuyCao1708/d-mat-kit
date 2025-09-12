import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  computed,
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { TABLE_OPTIONS } from '../../tokens/config';

/**
 * Defines an expandable row in the `DTable`.
 * Captures the template used to render row's only cell content and emits an event when row is expanded
 */
@Directive({
  selector: '[dExpandableRowDef], [d-expandable-row-def]',
})
export class DExpandableRowDef<T> {
  private readonly _defaultOptions = inject(TABLE_OPTIONS);

  /** The name of the column. Default is `expandedDetail` */
  columnName = input<string>(this._defaultOptions.expandableRow.columnName, {
    alias: 'dExpandableRowDef',
  });

  /**
   * Emits when a row is expanded.
   *
   * This event emits a function that can be used to collapse the row later.
   *
   * ### Usage in template
   * ```html
   * <ng-template
   *   d-expandable-row-def
       let-row
      (expanded)="handleRowExpanded($event)">
   * >
      <!--Your component or template-->
    </ng-template>
   * ```
   */
  expanded = output<() => void>();

  /** Template used to render cell content */
  template = inject<TemplateRef<{ $implicit: T }>>(TemplateRef<any>);

  private _expandableCell = signal<DExpandableCell | null>(null);

  _registerExpandableCell(expandableCell: DExpandableCell): void {
    this._expandableCell.set(expandableCell);
  }

  /** Cell's class attribute value */
  get classList() {
    return computed(() => this._expandableCell()?.classList() || []);
  }

  /** Whether the expandable row content should stick and resize on table width changes */
  get sticky() {
    return computed(() => this._expandableCell()?.sticky() ?? true);
  }
}

/** Base class for the expandable row cell. Captures cell properties. */
@Directive({
  selector: '[d-expandable-cell]',
})
export class DExpandableCell {
  private readonly _defaultOptions = inject(TABLE_OPTIONS);

  /** Cell's class attribute value */
  classList = input<string[], string | string[]>([], {
    alias: 'tdClass',
    transform: (value: string | string[]) => [value].flat().filter(Boolean),
  });

  /** Whether the expandable row content should stick and resize on table width changes */
  sticky = input<boolean, boolean | string>(
    this._defaultOptions.expandableRow.sticky,
    {
      transform: (value: string | boolean) => coerceBooleanProperty(value),
    }
  );

  constructor() {
    const expandableRowDef = inject(DExpandableRowDef, {
      host: true,
    });

    expandableRowDef._registerExpandableCell(this);
  }
}