import { Directive, ElementRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import {
  delay,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

type DInfiniteScrollLoadFunction = ((...args: any[]) => void) | undefined;

type DInfiniteScrollTriggerType = 'height' | 'index';

type DInfiniteScrollTrigger = {
  /** Whether load function called when panel scrolled through height or index threshold. */
  type: DInfiniteScrollTriggerType;
  /** Value of threshold (e.g., 0.9 for 90% height, or -3 for 3 items from bottom). */
  threshold: number;
};

@Directive({
  selector: `[dInfiniteScrollLoad], [dInfiniteScroll]`,
})
export class DInfiniteScroll {
  /** Emits whenever the overlay panel changes. */
  private readonly _panelElementRefChanges: Observable<ElementRef<HTMLElement>>;

  /** Callback function invoked when the panel scrolls beyond the defined trigger threshold. */
  dInfiniteScrollLoad = input<DInfiniteScrollLoadFunction>();

  /**
   * Configuration object that defines how the infinite scroll trigger behaves.
   * Determines when the panel should load more items, based on the trigger type and threshold.
   */
  dInfiniteScrollTrigger = input<
    DInfiniteScrollTrigger,
    DInfiniteScrollTriggerType | DInfiniteScrollTrigger
  >(
    { type: 'index', threshold: -10 },
    { transform: coerceInfiniteScrollLoadTriggerProperty }
  );

  private _isMatSelectOrAutocomplete = true;

  constructor() {
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
      this._isMatSelectOrAutocomplete = false;
      this._panelElementRefChanges = of(inject(ElementRef)).pipe(
        takeUntilDestroyed(),
        filter(Boolean)
      );
    }

    this.listenToPanelScroll();
  }

  private listenToPanelScroll() {
    this._panelElementRefChanges
      .pipe(
        takeUntilDestroyed(),
        map((elementRef) => elementRef.nativeElement),
        switchMap((element) =>
          fromEvent(element, 'scroll').pipe(
            map(() =>
              this.dInfiniteScrollTrigger().type === 'height'
                ? this.shouldLoadByHeight(element)
                : this.shouldLoadByIndex(element)
            ),
            distinctUntilChanged()
          )
        ),
        filter(Boolean)
      )
      .subscribe(() => this.dInfiniteScrollLoad()?.());
  }

  private shouldLoadByIndex(element: HTMLElement): boolean {
    let children;

    if (this._isMatSelectOrAutocomplete)
      children = element.querySelectorAll('.mat-mdc-option');
    else children = element.querySelectorAll(':scope > *');

    const total = children.length;

    if (total === 0) return false;

    const lastVisibleIndex = Array.from(children).findIndex((el) => {
      const htmlElement = el as HTMLElement;
      const optionBottom = htmlElement.offsetTop + htmlElement.offsetHeight;
      return optionBottom > element.scrollTop + element.clientHeight;
    });

    const visibleIndex = lastVisibleIndex === -1 ? total - 1 : lastVisibleIndex;

    const threshold = this.dInfiniteScrollTrigger().threshold;
    const thresholdIndex = threshold < 0 ? total + threshold : threshold;

    return visibleIndex >= thresholdIndex;
  }

  private shouldLoadByHeight(element: HTMLElement): boolean {
    const threshold =
      this.dInfiniteScrollTrigger().threshold * element.scrollHeight;

    const current = element.scrollTop + element.clientHeight;

    return current > threshold;
  }
}

function coerceInfiniteScrollLoadTriggerProperty(
  value: DInfiniteScrollTrigger | DInfiniteScrollTriggerType
): DInfiniteScrollTrigger {
  const DEFAULT_HEIGHT_THRESHOLD = 0.9;
  const DEFAULT_INDEX_THRESHOLD = -10;

  if (typeof value === 'object' && 'type' in value && 'threshold' in value) {
    return value;
  }

  if (value === 'height') {
    return { type: value, threshold: DEFAULT_HEIGHT_THRESHOLD };
  }

  return { type: 'index', threshold: DEFAULT_INDEX_THRESHOLD };
}
