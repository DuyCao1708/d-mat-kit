import {
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';

/** Defines allowed swipe orientations. */
export type DSwipeOrientation = 'horizontal' | 'vertical';

/** Defines possible directions after a completed swipe. */
export type DSwipedDirection = 'left' | 'right' | 'up' | 'down';

/** A directive that enables swipe gesture detection on an element. */
@Directive({
  selector: '[dSwipeable], [d-swipeable]',
})
export class DSwipe {
  /**
   * The orientation of the swipe gesture.
   * Can be either 'horizontal' or 'vertical'.
   * Default is 'horizontal'.
   */
  swipeOrientation = input<DSwipeOrientation>('horizontal', {
    alias: 'orientation',
  });
  /**
   * The minimum distance in pixels the user must swipe to trigger the `swiped` event.
   * Default is 50.
   */
  swipeThreshold = input<number>(50, { alias: 'threshold' });
  /** Emits the current swipe distance in pixels as the user is dragging. */
  swiping = output<number>();
  /** Emits when the user starts a swipe gesture. */
  swipeStart = output<void>();
  /** Emits when the swipe gesture ends (on pointer release). */
  swipeEnd = output<void>();
  /**
   * Emits the final swipe direction ('left', 'right', 'up', 'down')
   * if the swipe distance exceeds the threshold.
   */
  swiped = output<DSwipedDirection>();

  private readonly _elementRef = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private readonly _wrapperElement: HTMLElement;
  private readonly _removeListenerFncs: (() => void)[] = [];

  constructor() {
    this._wrapperElement = this._renderer.createElement('div');
    this._renderer.setStyle(this._wrapperElement, 'position', 'relative');
    this._renderer.setStyle(this._wrapperElement, 'overflow', 'visible');

    this._removeListenerFncs.push(
      this._renderer.listen(this._wrapperElement, 'mouseenter', () => {
        this._renderer.setStyle(this._wrapperElement, 'cursor', 'grab');
      })
    );

    this._removeListenerFncs.push(
      this._renderer.listen(this._wrapperElement, 'mouseleave', () => {
        this._renderer.removeStyle(this._wrapperElement, 'cursor');
      })
    );
  }

  ngAfterViewInit(): void {
    this.assignWrapperToElementRef();
    this.registerEventListeners();
  }

  private assignWrapperToElementRef(): void {
    const element = this._elementRef.nativeElement;

    const parent = this._renderer.parentNode(element);
    this._renderer.insertBefore(parent, this._wrapperElement, element);
    this._renderer.removeChild(parent, element);
    this._renderer.appendChild(this._wrapperElement, element);
  }

  private registerEventListeners(): void {
    let start = 0;
    let delta = 0;
    let isSwiping = false;
    const isHorizontalSwipe = this.swipeOrientation() === 'horizontal';

    const getPointerPosition = (e: PointerEvent) =>
      isHorizontalSwipe ? e.clientX : e.clientY;

    const applyTransform = (distance: number) => {
      const transform = isHorizontalSwipe
        ? `translateX(${distance}px)`
        : `translateY(${distance}px)`;
      this._renderer.setStyle(this._wrapperElement, 'transform', transform);
    };

    const setStartPosition = (event: PointerEvent) => {
      start = getPointerPosition(event);
      isSwiping = true;
      this._wrapperElement.setPointerCapture(event.pointerId);
      this.swipeStart.emit();
    };

    const setPositionByPointer = (event: PointerEvent) => {
      if (!isSwiping) return;

      delta = getPointerPosition(event) - start;
      applyTransform(delta);
      this.swiping.emit(delta);
    };

    const resetPosition = (event: PointerEvent) => {
      if (!isSwiping) return;
      isSwiping = false;
      this._wrapperElement.releasePointerCapture(event.pointerId);

      const finalDelta = getPointerPosition(event) - start;
      applyTransform(0);
      this.swipeEnd.emit();

      if (Math.abs(finalDelta) > this.swipeThreshold()) {
        const direction = this.getSwipeDirection(finalDelta, isHorizontalSwipe);
        this.swiped.emit(direction);
      }
    };

    this._removeListenerFncs.push(
      this._renderer.listen(
        this._wrapperElement,
        'pointerdown',
        setStartPosition
      )
    );
    this._removeListenerFncs.push(
      this._renderer.listen(
        this._wrapperElement,
        'pointermove',
        setPositionByPointer
      )
    );
    this._removeListenerFncs.push(
      this._renderer.listen(this._wrapperElement, 'pointerup', resetPosition)
    );
  }

  private getSwipeDirection(
    delta: number,
    isHorizontalSwipe: boolean
  ): DSwipedDirection {
    if (isHorizontalSwipe) {
      return delta > 0 ? 'right' : 'left';
    } else {
      return delta > 0 ? 'down' : 'up';
    }
  }

  ngOnDestroy(): void {
    this._removeListenerFncs.forEach((fn) => fn());
  }
}
