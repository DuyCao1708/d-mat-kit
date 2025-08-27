import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Directive({
  selector: '[d-popover-trigger-for], [dPopoverTriggerFor]',
})
export class DPopover {
  matMenuTriggerFor = input<MatMenuTrigger>(
    inject(MatMenuTrigger, { host: true }),
    {
      alias: 'dPopoverTriggerFor',
    }
  );

  private get matMenu(): MatMenu {
    return this.matMenuTriggerFor().menu as MatMenu;
  }

  private readonly _renderer = inject(Renderer2);
  private readonly _removeListenerFns: (() => void)[] = [];
  private _isPointerOnMenu = false;
  private _isPointerOnTrigger = false;

  ngOnInit(): void {
    this.matMenu.hasBackdrop = false;

    this.matMenuTriggerFor().menuOpened.subscribe(() => {
      const menuPanel = document.querySelector('.mat-mdc-menu-panel');

      if (menuPanel) {
        this._removeListenerFns.push(
          this._renderer.listen(
            menuPanel,
            'mouseenter',
            () => (this._isPointerOnMenu = true)
          )
        );

        this._removeListenerFns.push(
          this._renderer.listen(menuPanel, 'mouseleave', () => {
            setTimeout(() => {
              this._isPointerOnMenu = false;

              if (!this._isPointerOnTrigger)
                this.matMenuTriggerFor().closeMenu();
            }, 80);
          })
        );
      }
    });

    this.matMenuTriggerFor().menuClosed.subscribe(() =>
      this._removeListenerFns.forEach((fn) => fn())
    );
  }

  @HostListener('mouseenter')
  openMenuOnMouseEnterOrClick() {
    this._isPointerOnTrigger = true;
    this.matMenuTriggerFor().openMenu();
  }

  @HostListener('mouseleave')
  closeMenuOnMouseLeave() {
    setTimeout(() => {
      this._isPointerOnTrigger = false;

      if (!this._isPointerOnMenu) {
        this.matMenuTriggerFor().closeMenu();
      }
    }, 100);
  }
}
