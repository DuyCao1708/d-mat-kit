import {
  Component,
  effect,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  inject,
  input,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DTable } from './table';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';

/**
 * Responsible for rendering the content of an expandable row inside a {@link DTable}.
 * as well as observing the table's size to maintain correct width when sticky positioning is applied.
 *
 * @template T The type of the data row this expandable outlet binds to.
 */
@Component({
  selector: 'd-table-expandable-outlet',
  imports: [],
  template: ` <!--prettier-ignore-->
    <ng-container
      #viewContainer
  ></ng-container>`,
  styles: [
    `
      :host {
        display: block;
        min-height: 0;
        overflow: hidden;
        transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1);
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

  @ViewChild('viewContainer', { read: ViewContainerRef })
  private readonly _viewContainerRef: ViewContainerRef;

  private _resizeObserver: ResizeObserver;
  private _table = inject(DTable);
  private _renderer = inject(Renderer2);
  private _hostElement = inject(ElementRef<HTMLElement>).nativeElement;
  private _viewRef: EmbeddedViewRef<{ $implicit: T }> | null = null;

  /**
   * The expandable row definition from the parent table.
   */
  get expandableRowDef() {
    return this._table.expandableRowDef()!;
  }

  @HostBinding('style') get hostStickyStyles() {
    const isSticky = this.expandableRowDef.sticky();

    if (!isSticky) return '';
    else return ['position: sticky', 'left: 0'].join('; ');
  }

  private readonly _isExpanded$ = toObservable(this.expanded).pipe(
    takeUntilDestroyed(),
    distinctUntilChanged()
  );

  constructor() {
    this.setupResizeEffect();
  }

  ngAfterViewInit(): void {
    this.listenToExpansionState();
  }

  private listenToExpansionState() {
    let removeListenerFn: (() => void) | null = null;

    this._isExpanded$.subscribe((isExpanded) => {
      if (isExpanded) {
        removeListenerFn?.();
        this._renderer.setStyle(this._hostElement, 'opacity', '1');

        if (!this._viewRef || this._viewRef.destroyed) {
          this._viewRef = this.createEmbeddedView();
        }
      } else {
        this._renderer.setStyle(this._hostElement, 'opacity', '0');

        const clearViewRef = (event: TransitionEvent) => {
          if (event.propertyName === 'opacity') {
            removeListenerFn?.();

            this._viewContainerRef.clear();
            this._viewRef = null;
          }
        };

        removeListenerFn = this._renderer.listen(
          this._hostElement,
          'transitionend',
          clearViewRef
        );
      }
    });
  }

  private setupResizeEffect() {
    const tableElement = this._table.elementRef.nativeElement;

    this._resizeObserver = new ResizeObserver(() => {
      const tableWidth = tableElement.clientWidth;
      this._renderer.setStyle(this._hostElement, 'width', `${tableWidth}px`);
    });

    effect(() => {
      if (this.expandableRowDef?.sticky()) {
        this._resizeObserver.observe(tableElement);
      } else {
        this._resizeObserver.disconnect();
        this._renderer.removeStyle(this._hostElement, 'width');
      }
    });
  }

  private createEmbeddedView(): EmbeddedViewRef<{ $implicit: T }> {
    return this._viewContainerRef.createEmbeddedView(
      this.expandableRowDef.template,
      {
        $implicit: this.context(),
      }
    );
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
  }
}
