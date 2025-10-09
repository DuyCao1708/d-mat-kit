import {
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

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
    alias: 'dSwipeable',
  });
  /**
   * The minimum distance in pixels the user must swipe to trigger the `swiped` event.
   * Default is 50.
   */
  swipeThreshold = input<number>(50, { alias: 'threshold' });
  /** Whether the swipe gesture is disabled. */
  disabled = input<boolean, boolean | string>(false, {
    transform: (v) => coerceBooleanProperty(v),
  });
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
  private readonly _removeListenerFns: (() => void)[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this.registerEventListeners();
  }

  private registerEventListeners(): void {
    let start = 0;
    let delta = 0;
    let isSwiping = false;
    const isHorizontalSwipe = this.swipeOrientation() === 'horizontal';
    const isDisabled = this.disabled();
    const element = this._elementRef.nativeElement;
    /**
     * @NOTE When use setPointerCapture, all the pointer event will return target as this._elementRef instead of its child wheather the child is clicked
     * Therefore, store the true target before set pointer capture then invoke the click when pointer is up
     */
    let pointerDownTarget: EventTarget | null = null;

    const getPointerPosition = (event: PointerEvent) =>
      isHorizontalSwipe ? event.clientX : event.clientY;

    const applyTransform = (distance: number) => {
      if (isDisabled) return;

      const transform = isHorizontalSwipe
        ? `translateX(${distance}px)`
        : `translateY(${distance}px)`;
      this._renderer.setStyle(element, 'transform', transform);
    };

    const setStartPosition = (event: PointerEvent) => {
      start = getPointerPosition(event);
      isSwiping = true;

      pointerDownTarget = event.target;

      element.setPointerCapture(event.pointerId);

      !isDisabled && this.swipeStart.emit();
    };

    const setPositionByPointer = (event: PointerEvent) => {
      if (!isSwiping) return;

      delta = getPointerPosition(event) - start;

      applyTransform(delta);
      !isDisabled && this.swiping.emit(delta);
    };

    const resetPosition = (event: PointerEvent) => {
      if (!isSwiping) return;
      isSwiping = false;
      element.releasePointerCapture(event.pointerId);

      const finalDelta = getPointerPosition(event) - start;
      applyTransform(0);
      !isDisabled && this.swipeEnd.emit();

      if (Math.abs(finalDelta) > this.swipeThreshold()) {
        const direction = this.getSwipeDirection(finalDelta, isHorizontalSwipe);
        !isDisabled && this.swiped.emit(direction);
      }

      //Invoke the true pointer target;
      (pointerDownTarget as HTMLElement)?.click?.();
    };

    this._removeListenerFns.push(
      this._renderer.listen(element, 'pointerdown', setStartPosition)
    );
    this._removeListenerFns.push(
      this._renderer.listen(element, 'pointermove', setPositionByPointer)
    );
    this._removeListenerFns.push(
      this._renderer.listen(element, 'pointerup', resetPosition)
    );
    this._removeListenerFns.push(
      this._renderer.listen(element, 'mouseenter', () => {
        if (!this.disabled()) {
          this._renderer.setStyle(element, 'cursor', 'grab');
        }
      })
    );
    this._removeListenerFns.push(
      this._renderer.listen(element, 'mouseleave', () => {
        this._renderer.removeStyle(element, 'cursor');
      })
    );
    //Disable default behavior of touch on mobile device to allow swipe
    this._removeListenerFns.push(
      this._renderer.listen(element, 'touchmove', (event) => {
        event.preventDefault();
      })
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
    this._removeListenerFns.forEach((fn) => fn());
  }
}
