import {
  CdkVirtualForOf,
} from '@angular/cdk/scrolling';
import {
  AfterContentInit,
  DestroyRef,
  Directive,
  EmbeddedViewRef,
  inject,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatOption, MatSelect } from '@angular/material/select';
import { combineLatest, map, startWith } from 'rxjs';

@Directive({
  selector: '[dVirtualOptionForOf]',
  hostDirectives: [
    {
      directive: CdkVirtualForOf,
      inputs: [
        'cdkVirtualForOf: dVirtualOptionForOf',
        'cdkVirtualForTemplate: dVirtualOptionForTemplate',
        'cdkVirtualForTemplateCacheSize: dVirtualOptionForTemplateCachheSize',
        'cdkVirtualForTrackBy: dVirtualOptionForTrackBy',
      ],
    },
  ],
})
export class DVirtualOptionForOf implements AfterContentInit {
  private _matSelect = inject(MatSelect);
  private _templateRef = inject(TemplateRef<any>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _destroyRef = inject(DestroyRef);

  private _renderedViewRefMap = new Map<any, EmbeddedViewRef<any>>();
  private _selectedMatOptionMap = new Map<any, MatOption>();

  private _dataSource = toSignal(
    inject(CdkVirtualForOf, { host: true }).dataStream,
    { initialValue: [] }
  );

  ngAfterContentInit() {
    const matOptions$ = this._matSelect.options.changes.pipe(
      map(() => this._matSelect.options.toArray())
    );

    const selectedValues$ = this._matSelect.valueChange.pipe(
      startWith(this._matSelect.value),
      map(() => [this._matSelect.value].flat().filter(Boolean))
    );

    combineLatest([selectedValues$, matOptions$])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((changes) => this.renderHiddenOptions(...changes));
  }

  private renderHiddenOptions(
    selectedValues: any[],
    visibleMatOptions: MatOption[]
  ) {
    const matOptionMap = this.groupMatOptionsToMap(visibleMatOptions);

    //Add hidden options which are selected
    for (const value of selectedValues) {
      const isVisible = matOptionMap.has(value);

      if (!this._renderedViewRefMap.has(value) && !isVisible) {
        const viewRef = this.createEmbededViewRef(value);

        this._renderedViewRefMap.set(value, viewRef);
      }

      if (isVisible)
        this._selectedMatOptionMap.set(value, matOptionMap.get(value)![0]);
    }

    // Remove views that are no longer selected
    for (const [value, viewRef] of this._renderedViewRefMap.entries()) {
      const isSelected = selectedValues.includes(value);
      // This may includes the original and the virtual one which is embeded before
      const visibleCount = matOptionMap.get(value)?.length || 0;

      const shouldRemove = visibleCount > 1;

      if (!isSelected || (isSelected && shouldRemove)) {
        this.removeViewRef(viewRef);

        this._renderedViewRefMap.delete(value);
      }
    }
  }

  private groupMatOptionsToMap(options: MatOption[]) {
    const map = new Map<any, MatOption[]>();

    for (const option of options) {
      const value = option.value;
      const group = map.get(value) ?? [];
      group.push(option);
      map.set(value, group);
    }

    return map;
  }

  private createEmbededViewRef(value: any) {
    const viewRef = this._viewContainerRef.createEmbeddedView(
      this._templateRef,
      {
        $implicit: value,
      }
    );

    setTimeout(() => {
      const element = viewRef.rootNodes.find(
        (node) => node instanceof HTMLElement
      );

      if (element) {
        element.setAttribute('style', 'display: none');
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('selected', '');
        element.setAttribute('d-virtual-option', '');
      }
    });

    return viewRef;
  }

  private removeViewRef(viewRef: EmbeddedViewRef<any>) {
    const index = this._viewContainerRef.indexOf(viewRef);

    if (index > -1) {
      this._viewContainerRef.remove(index);
    }
  }
}
