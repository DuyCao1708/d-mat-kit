import {
  Component,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DExpandableCellOutletRef } from '../../directives';
import { DTable } from './table';

/**
 * Responsible for rendering the content of an expandable row inside a {@link DTable}.
 * as well as observing the table's size to maintain correct width when sticky positioning is applied.
 *
 * @template T The type of the data row this expandable outlet binds to.
 */
@Component({
  selector: 'd-table-expandable-outlet',
  imports: [DExpandableCellOutletRef],
  template: ` <!--prettier-ignore-->
    <ng-container
      *dExpandableCellOutletRef="
      expandableRowDef.template;
      context: context();
      expanded: expanded()
    "
  ></ng-container>`,
  styles: [
    `
      :host {
        display: block;
        min-height: 0;
      }
    `,
  ],
})
export class DTableExpandableOutlet<T> {
  /** Context for the row template, typically the data item of type `T`. */
  context = input.required<T>();
  /** Whether the expandable row is currently expanded. */
  expanded = input<boolean, boolean | string>(false, {
    transform: (value: string | boolean) => coerceBooleanProperty(value),
  });

  private _resizeObserver: ResizeObserver | null = null;
  private _table = inject(DTable);

  /**
   * The expandable row definition from the parent table.
   */
  get expandableRowDef() {
    return this._table.expandableRowDef()!;
  }

  constructor() {
    const tableElement = this._table.elementRef.nativeElement;
    const renderer = inject(Renderer2);
    const hostElement = inject(ElementRef).nativeElement;

    effect(() => {
      if (this.expandableRowDef?.sticky()) {
        this._resizeObserver = new ResizeObserver(() => {
          const tableWidth = tableElement.clientWidth;

          renderer.setStyle(hostElement, 'width', `${tableWidth}px`);
        });

        this._resizeObserver.observe(tableElement);
      } else {
        renderer.removeStyle(hostElement, 'width');

        this._resizeObserver?.disconnect();
      }
    });
  }

  @HostBinding('style') get hostStyles() {
    const isSticky = this.expandableRowDef.sticky();

    if (!isSticky) return '';
    else return ['position: sticky', 'left: 0'].join('; ');
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
  }
}
