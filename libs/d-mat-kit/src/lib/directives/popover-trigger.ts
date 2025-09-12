import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
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
  selector: '[d-popover-trigger-for], [dPopoverTriggerFor]',
})
export class DPopoverTrigger {
  private readonly _matMenuTrigger = inject(MatMenuTrigger, {
    host: true,
    optional: true,
  });

  /**
   * References the menu trigger instance that the menu is associated with,
   * or uses the injected host trigger by default.
   */
  matMenuTrigger = input<MatMenuTrigger>(this._matMenuTrigger!, {
    alias: 'dPopoverTriggerFor',
  });
  /**
   * Whether the menu should automatically close when a menu item is clicked.
   * Defaults to `true`. Set to `false` for persistent popovers.
   */
  closeOnClick = input<boolean, boolean | string>(true, {
    transform: (v) => coerceBooleanProperty(v),
  });

  private readonly _elementRef = inject(ElementRef);

  private get _matMenu() {
    return this.matMenuTrigger().menu as MatMenu | null;
  }

  private readonly _renderer = inject(Renderer2);
  private readonly _removeListenerFns: (() => void)[] = [];
  private _isPointerEnteredMenu = false;
  private _isPointerEnteredTrigger = false;
  private _isMenuOpenedByHover = false;

  ngOnInit(): void {
    if (!this.matMenuTrigger()) {
      throw new Error(
        'MatMenuTrigger not found on host element neither input.'
      );
    }

    this.listenToMenuClose();
    this.listenToMenuOpen();

    if (!this.closeOnClick()) {
      this.configureOverlayClose();
    }
  }

  ngAfterViewInit(): void {
    this.disableMenuBackdrop();
  }

  @HostListener('mouseenter')
  protected openMenuOnMouseEnterOrClick() {
    this._isPointerEnteredTrigger = true;
    this._isMenuOpenedByHover = true;
    this.matMenuTrigger().openMenu();
  }

  @HostListener('mouseleave')
  protected closeMenuOnMouseLeave() {
    this._isPointerEnteredTrigger = false;

    setTimeout(() => {
      if (!this._isPointerEnteredMenu && this._isMenuOpenedByHover)
        this.matMenuTrigger().closeMenu();
    }, 50);
  }

  @HostListener('document:click', ['$event'])
  protected closeMenuOnClickOutside(event: Event): void {
    const element = this._elementRef.nativeElement;
    const triggerElement = (this.matMenuTrigger() as any)._element
      .nativeElement;
    const menuPanelId = this._matMenu?.panelId;

    if (!menuPanelId) return;

    const menuPanel = document.querySelector(`#${CSS.escape(menuPanelId)}`);

    if (!menuPanel || !element) return;

    const clickTarget = event.target as HTMLElement;

    const clickedInsideTrigger = triggerElement.contains(clickTarget);
    const clickedInsideHost = element.contains(clickTarget);
    const clickedInsideMenu = menuPanel.contains(clickTarget);

    if (!clickedInsideTrigger && !clickedInsideMenu && !clickedInsideHost) {
      this.matMenuTrigger().closeMenu();
    }
  }

  private disableMenuBackdrop(): void {
    if (this._matMenu) this._matMenu.hasBackdrop = false;
  }

  private listenToMenuOpen(): void {
    this.matMenuTrigger().menuOpened.subscribe(() => {
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
    });

    const leaveListener = this._renderer.listen(menuPanel, 'mouseleave', () => {
      setTimeout(() => {
        this._isPointerEnteredMenu = false;

        if (!this._isPointerEnteredTrigger && this._isMenuOpenedByHover) {
          this.matMenuTrigger().closeMenu();
        }
      }, 80);
    });

    this._removeListenerFns.push(enterListener, leaveListener);
  }

  private listenToMenuClose(): void {
    this.matMenuTrigger().menuClosed.subscribe(() => {
      this._removeListenerFns.forEach((fn) => fn());
      this._isMenuOpenedByHover = false;
    });
  }

  private configureOverlayClose(): void {
    if (!this._matMenu) return;

    const menuClosed = this._matMenu.closed as Subject<any>;
    const closedEmitter = new EventEmitter();
    closedEmitter
      .pipe(
        filter((event: MenuCloseReason) => {
          return event !== 'click';
        })
      )
      .subscribe({
        next: (event) => menuClosed.next(event),
        error: (error) => menuClosed.next(error),
        complete: () => menuClosed.complete,
      });

    (this._matMenu.closed as any) = closedEmitter;
  }
}
