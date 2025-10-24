import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import {
  _RecycleViewRepeaterStrategy,
  _VIEW_REPEATER_STRATEGY,
  _ViewRepeaterItemInsertArgs,
  ArrayDataSource,
  CollectionViewer,
  DataSource,
  isDataSource,
  ListRange,
} from '@angular/cdk/collections';
import {
  AfterContentInit,
  AfterViewInit,
  computed,
  Directive,
  DoCheck,
  effect,
  ElementRef,
  EmbeddedViewRef,
  inject,
  input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  OnDestroy,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import {
  delay,
  distinctUntilChanged,
  filter,
  fromEvent,
  isObservable,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

/** The context for an item rendered by `DOptionForOf` */
export type DOptionForOfContext<T> = {
  /** The item value. */
  $implicit: T;
  /** The DataSource, Observable, or NgIterable that was passed to *dOptionFor. */
  dOptionForOf: DataSource<T> | Observable<T[]> | NgIterable<T>;
  /** The index of the item in the DataSource. */
  index: number;
  /** The number of items in the DataSource. */
  count: number;
  /** Whether this is the first item in the DataSource. */
  first: boolean;
  /** Whether this is the last item in the DataSource. */
  last: boolean;
  /** Whether the index is even. */
  even: boolean;
  /** Whether the index is odd. */
  odd: boolean;
};

type DOptionForLoadFunction = ((...args: any[]) => void) | undefined;

@Directive({
  selector: '[dOptionFor][dOptionForOf]',
  // Use viewRepeater for recycle data when data source changes (eg. load function called)
  providers: [
    {
      provide: _VIEW_REPEATER_STRATEGY,
      useClass: _RecycleViewRepeaterStrategy,
    },
  ],
})
export class DOptionForOf<T>
  implements CollectionViewer, DoCheck, AfterContentInit, OnDestroy
{
  private _templateRef = inject(TemplateRef<any>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _differs = inject(IterableDiffers);
  private _viewRepeater = inject<
    _RecycleViewRepeaterStrategy<T, T, DOptionForOfContext<T>>
  >(_VIEW_REPEATER_STRATEGY);

  /** The DataSource to display. */
  dOptionForOf = input.required<
    DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined
  >();

  /** Call when the panel scroll through the 90% of panel height. Useful for infinite scroll panel */
  dOptionForLoad = input<DOptionForLoadFunction>();

  /**
   * The `TrackByFunction` to use for tracking changes. The `TrackByFunction` takes the index and
   * the item and produces a value to be used as the item's identity when tracking changes.
   */
  dOptionForTrackBy = input<TrackByFunction<T>>();

  /**
   * The size of the cache used to store templates that are not being used for re-use later.
   * Setting the cache size to `0` will disable caching. Defaults to 20 templates.
   */
  dOptionForTemplateCacheSize = input<NumberInput>();
  private readonly _cacheSizeEffect = effect(
    () =>
      (this._viewRepeater.viewCacheSize = coerceNumberProperty(
        this.dOptionForTemplateCacheSize()
      ))
  );

  private readonly _dataSource = computed(() => {
    const options = this.dOptionForOf();

    if (isDataSource(options)) {
      return options;
    } else {
      // If value is an an NgIterable, convert it to an array.
      return new ArrayDataSource<T>(
        isObservable(options) ? options : Array.from(options || [])
      );
    }
  });

  /** Emits when the rendered view of the data changes. */
  readonly viewChange = new Subject<ListRange>();

  /** Emits whenever the data in the current DataSource changes. */
  readonly dataStream: Observable<readonly T[]> = toObservable(
    this._dataSource
  ).pipe(
    // Start off with null `DataSource`.
    startWith(null),
    // Bundle up the previous and current data sources so we can work with both.
    pairwise(),
    // Use `_changeDataSource` to disconnect from the previous data source and connect to the
    // new one, passing back a stream of data changes which we run through `switchMap` to give
    // us a data stream that emits the latest data from whatever the current `DataSource` is.
    switchMap(([prev, cur]) => this.changeDataSource(prev, cur)),
    // Replay the last emitted data when someone subscribes.
    shareReplay(1)
  );

  /** Emits whenever the overlay panel changes */
  private readonly _panelElementRefChanges: Observable<ElementRef<HTMLElement>>;

  /** The differ used to calculate changes to the data. */
  private _differ: IterableDiffer<T> | null = null;

  /** The most recent data emitted from the DataSource. */
  private _data: readonly T[];

  /** Whether the rendered data should be updated during the next ngDoCheck cycle. */
  private _needsUpdate = false;

  constructor() {
    this.dataStream.pipe(takeUntilDestroyed()).subscribe((data) => {
      this._data = data;
      this.setDifferOnDataChange();
    });

    const matSelect = inject(MatSelect, { optional: true });
    const matAutocomplete = inject(MatAutocomplete, { optional: true });

    if (matSelect) {
      this._panelElementRefChanges = matSelect.openedChange.pipe(
        filter(Boolean),
        takeUntilDestroyed(),
        delay(0),
        map(() => matSelect.panel),
        filter(Boolean)
      );
    } else if (matAutocomplete) {
      this._panelElementRefChanges = matAutocomplete.opened.pipe(
        takeUntilDestroyed(),
        delay(0),
        map(() => matAutocomplete.panel),
        filter(Boolean)
      );
    } else {
      throw new Error(
        '[dOptionForOf] must be used inside a MatSelect or MatAutocomplete component with an overlay panel.'
      );
    }

    this.listenToPanelScroll();
  }

  ngDoCheck() {
    if (this._differ && this._needsUpdate) {
      const changes = this._differ.diff(this._data);
      if (!changes) {
        this.updateContext();
      } else {
        this.applyChanges(changes);
      }
      this._needsUpdate = false;
    }
  }

  ngAfterContentInit() {
    // const matOptions$ = this._matSelect.options.changes.pipe(
    //       map(() => this._matSelect.options.toArray())
    //     );
    
    //     const selectedValues$ = this._matSelect.valueChange.pipe(
    //       startWith(this._matSelect.value),
    //       map(() => [this._matSelect.value].flat().filter(Boolean))
    //     );
    
    //     combineLatest([selectedValues$, matOptions$])
    //       .pipe(takeUntilDestroyed(this._destroyRef))
    //       .subscribe((changes) => this.renderHiddenOptions(...changes));
  }

  ngOnDestroy() {
    this.viewChange.complete();
    this._viewRepeater.detach();
  }

  private changeDataSource(
    oldDs: DataSource<T> | null,
    newDs: DataSource<T> | null
  ): Observable<readonly T[]> {
    if (oldDs) {
      oldDs.disconnect(this);
    }

    return newDs ? newDs.connect(this) : of();
  }

  private listenToPanelScroll() {
    this._panelElementRefChanges
      .pipe(
        takeUntilDestroyed(),
        map((elementRef) => elementRef.nativeElement),
        switchMap((element) =>
          fromEvent(element, 'scroll').pipe(
            map(() => {
              const threshold = 0.9 * element.scrollHeight;
              const current = element.scrollTop + element.clientHeight;

              return current > threshold;
            }),
            distinctUntilChanged()
          )
        ),
        filter(Boolean)
      )
      .subscribe(() => this.dOptionForLoad()?.());
  }

  private setDifferOnDataChange() {
    if (!this._differ) {
      // Use a wrapper function for the `trackBy` so any new values are
      // picked up automatically without having to recreate the differ.
      this._differ = this._differs.find(this._data).create((index, item) => {
        const trackByFn = this.dOptionForTrackBy();

        return trackByFn ? trackByFn(index, item) : item;
      });
    }
    this._needsUpdate = true;
  }

  private updateContext() {
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      const view = this._viewContainerRef.get(i) as EmbeddedViewRef<
        DOptionForOfContext<T>
      >;
      view.context.index = i;
      view.context.count = count;
      this.updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }

  private updateComputedContextProperties(context: DOptionForOfContext<any>) {
    context.first = context.index === 0;
    context.last = context.index === context.count - 1;
    context.even = context.index % 2 === 0;
    context.odd = !context.even;
  }

  private applyChanges(changes: IterableChanges<T>) {
    this._viewRepeater.applyChanges(
      changes,
      this._viewContainerRef,
      (
        record: IterableChangeRecord<T>,
        _adjustedPreviousIndex: number | null,
        currentIndex: number | null
      ) => this.getEmbeddedViewArgs(record, currentIndex!),
      (record) => record.item
    );

    // Update $implicit for any items that had an identity change.
    changes.forEachIdentityChange((record: IterableChangeRecord<T>) => {
      const view = this._viewContainerRef.get(
        record.currentIndex!
      ) as EmbeddedViewRef<DOptionForOfContext<T>>;
      view.context.$implicit = record.item;
    });

    // Update the context variables on all items.
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      const view = this._viewContainerRef.get(i) as EmbeddedViewRef<
        DOptionForOfContext<T>
      >;
      view.context.index = i;
      view.context.count = count;
      this.updateComputedContextProperties(view.context);
    }
  }

  private getEmbeddedViewArgs(
    record: IterableChangeRecord<T>,
    index: number
  ): _ViewRepeaterItemInsertArgs<DOptionForOfContext<T>> {
    // Note that it's important that we insert the item directly at the proper index,
    // rather than inserting it and the moving it in place, because if there's a directive
    // on the same node that injects the `ViewContainerRef`, Angular will insert another
    // comment node which can throw off the move when it's being repeated for all items.
    return {
      templateRef: this._templateRef,
      context: {
        $implicit: record.item,
        dOptionForOf: this.dOptionForOf()!,
        index: -1,
        count: -1,
        first: false,
        last: false,
        odd: false,
        even: false,
      },
      index,
    };
  }

  static ngTemplateContextGuard<T>(
    directive: DOptionForOf<T>,
    context: unknown
  ): context is DOptionForOfContext<T> {
    return true;
  }
}
