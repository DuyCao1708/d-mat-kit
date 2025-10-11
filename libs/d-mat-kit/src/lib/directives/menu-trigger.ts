import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { MediaMatcher } from '@angular/cdk/layout';
import {
  Directive,
  EventEmitter,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import {
  MatMenu,
  MatMenuTrigger,
  MenuCloseReason,
} from '@angular/material/menu';
import { filter, Subject } from 'rxjs';

/**
 * Directive applied to an element that should trigger a `mat-menu`.
 * It enhances Angular Material's `MatMenuTrigger` to support popover-like behavior on hover.
 */
@Directive({
  selector: '[dMenuTriggerFor], [d-menu-trigger-for]',
  hostDirectives: [
    {
      directive: MatMenuTrigger,
      inputs: [
        'matMenuTriggerFor: dMenuTriggerFor',
        'matMenuTriggerData: dMenuTriggerData',
        'matMenuTriggerRestoreFocus: dMenuTriggerRestoreFocus',
      ],
      outputs: ['menuClosed', 'menuOpened'],
    },
  ],
  host: {
    '(mouseenter)': 'openMenuOnMouseEnter()',
    '(mouseleave)': 'closeMenuOnMouseLeave()',
  },
  exportAs: 'dMenuTrigger',
})
export class DMenuTrigger {
  private _renderer = inject(Renderer2);
  private _matMenuTrigger = inject(MatMenuTrigger, { host: true });

  private get _matMenu() {
    return this._matMenuTrigger.menu as MatMenu | null;
  }

  private _isHoverableDevice =
    inject(MediaMatcher).matchMedia('(hover: hover)').matches;

  private _isPointerEnteredTrigger = false;
  private _isMenuOpenedByHover = false;
  private _isPointerEnteredMenu = false;
  private _enterTriggerTimeoutId: number | undefined;
  private _leaveTriggerTimeoutId: number | undefined;
  private _leaveMenuTimeoutId: number | undefined;
  private readonly _removeListenerFns: (() => void)[] = [];

  //#region Inputs
  /**
   * Whether the menu should open on trigger hover.
   *
   * Applicable on hoverable device only
   */
  hoverable = input<boolean, boolean | string>(false, {
    transform: (value: string | boolean) =>
      coerceBooleanProperty(value) && this._isHoverableDevice,
    alias: 'dMenuTriggerHoverable',
  });

  /**
   * Indicates the delay duration to open menu on hover.
   *
   * Applicable when `dMenuTriggerHoverable` is set to `true`
   */
  menuOpenDelay = input<number, number | string>(100, {
    alias: 'dMenuTriggerOpenDelay',
    transform: (value: string | number) =>
      Math.max(coerceNumberProperty(value), 0),
  });

  /**
   * Indicates the delay duration to close menu on leave.
   *
   * Applicable when `dMenuTriggerHoverable` is set to `true`
   */
  menuCloseDelay = input<number, number | string>(100, {
    alias: 'dMenuTriggerCloseDelay',
    transform: (value: string | number) =>
      Math.max(coerceNumberProperty(value), 0),
  });

  /**
   * Whether the menu should stay open when hovering over the menu panel.
   *
   * Applicable when `dMenuTriggerHoverable` is set to `true`
   */
  menuStayOpenOnHover = input<boolean, boolean | string>(true, {
    transform: coerceBooleanProperty,
    alias: 'dMenuTriggerStayOpenOnMenuHover',
  });

  /** Whether the menu should close when a menu item is clicked. */
  menuCloseOnClick = input<boolean, boolean | string>(true, {
    transform: coerceBooleanProperty,
    alias: 'dMenuTriggerCloseOnClick',
  });
  //#endregion

  ngOnInit() {
    if (!this.menuCloseOnClick()) this.configureOverlayClose();

    if (this.hoverable() && this.menuStayOpenOnHover()) {
      this.listenToMenuOpen();
      this.listenToMenuClose();
    }
  }

  ngAfterViewInit(): void {
    if (this._matMenu && this.hoverable()) this._matMenu.hasBackdrop = false;
  }

  protected openMenuOnMouseEnter() {
    if (!this.hoverable()) return;

    this._isPointerEnteredTrigger = true;

    clearTimeout(this._leaveTriggerTimeoutId);

    this._enterTriggerTimeoutId = setTimeout(() => {
      this._matMenuTrigger.openMenu();
      this._isMenuOpenedByHover = true;
      this._enterTriggerTimeoutId = undefined;
    }, this.menuOpenDelay());
  }

  protected closeMenuOnMouseLeave() {
    if (!this.hoverable()) return;

    this._isPointerEnteredTrigger = false;

    clearTimeout(this._enterTriggerTimeoutId);

    this._leaveTriggerTimeoutId = setTimeout(() => {
      if (this._isMenuOpenedByHover && !this._isPointerEnteredMenu) {
        this._matMenuTrigger.closeMenu();
      }

      this._leaveTriggerTimeoutId = undefined;
    }, this.menuCloseDelay() + 50);
  }

  private listenToMenuOpen() {
    this._matMenuTrigger.menuOpened.subscribe(() => {
      const menuPanelId = this._matMenu?.panelId;

      if (!menuPanelId) return;

      const menuPanel = document.querySelector(`#${CSS.escape(menuPanelId)}`);

      if (!menuPanel) return;

      this.addMenuHoverListeners(menuPanel);
    });
  }

  private addMenuHoverListeners(menuPanel: Element): void {
    const enterListener = this._renderer.listen(menuPanel, 'mouseenter', () => {
      this._isPointerEnteredMenu = true;

      clearTimeout(this._leaveMenuTimeoutId);
    });

    const leaveListener = this._renderer.listen(menuPanel, 'mouseleave', () => {
      this._isPointerEnteredMenu = false;

      this._leaveMenuTimeoutId = setTimeout(() => {
        if (!this._isPointerEnteredTrigger && this._isMenuOpenedByHover) {
          this._matMenuTrigger.closeMenu();
        }

        this._leaveMenuTimeoutId = undefined;
      }, this.menuCloseDelay() + 80);
    });

    this._removeListenerFns.push(enterListener, leaveListener);
  }

  private listenToMenuClose(): void {
    this._matMenuTrigger.menuClosed.subscribe(() => {
      while (this._removeListenerFns.length) {
        const fn = this._removeListenerFns.pop();
        if (fn) fn();
      }

      this._isMenuOpenedByHover = false;
    });
  }

  private configureOverlayClose() {
    if (!this._matMenu) return;

    const menuClosed$ = this._matMenu.closed as Subject<MenuCloseReason>;

    const closeEmitter = new EventEmitter();
    closeEmitter
      .pipe(filter((event: MenuCloseReason) => event !== 'click'))
      .subscribe({
        next: (event) => menuClosed$.next(event),
        error: (error) => menuClosed$.next(error),
        complete: () => menuClosed$.complete(),
      });

    (this._matMenu.closed as any) = closeEmitter;
  }
}
