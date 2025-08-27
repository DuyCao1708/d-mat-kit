import { Component, HostBinding, input, output } from '@angular/core';
import { DNotificationType, DToastOptions } from '../../../models';
import { provideMarkdown, MarkdownComponent } from 'ngx-markdown';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Component for displaying a toast message with icon, markdown-supported content, and close button.
 *
 * Used internally by the `DNotification` service when calling `toast(...)`.
 */
@Component({
  selector: 'd-toast',
  imports: [MarkdownComponent, MatIconModule, MatButtonModule],
  template: `
    <mat-icon style="min-width: 24px">{{ matFontIcon }}</mat-icon>

    <markdown>
      {{ options().message }}
    </markdown>

    <button
      mat-icon-button
      class="d-toast-button-icon-close"
      (click)="close.emit()"
    >
      <mat-icon>clear</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        position: relative;
        width: min(350px, 72vw);
        height: fit-content;
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0px 40px 0px 16px;
        margin-bottom: 4px;
        border-radius: var(--d-toast-container-shape);
      }

      .d-toast-button-icon-close {
        position: absolute;
        right: 12px;
        top: 12px;
        display: flex;
        align-items: center;

        mat-icon {
          font-size: 1.125rem;
          line-height: 1.5rem;
        }

        --mat-icon-button-state-layer-size: 24px;
        --mat-icon-color: var(--mat-sys-outline-variant);
      }
    `,
  ],
  providers: [provideMarkdown()],
})
export class DToast {
  /** Required toast options. */
  options = input.required<DToastOptions>();
  /**
   * Emits an event when the close button is clicked.
   * Used to remove the toast from the list.
   */
  close = output<void>();

  /** Dynamically binds background color based on the toast type. */
  @HostBinding('style.background-color') get getBackgroundColor() {
    return `var( --d-toast-${this.options().type}-container-color)`;
  }

  /** Dynamically binds text color based on the toast type. */
  @HostBinding('style.color') get getTextColor() {
    return `var( --d-toast-${this.options().type}-text-color)`;
  }

  /**
   * Binds animation styles for slide-in and fade-out effects.
   * Fade-out timing depends on `options.timeout`.
   */
  @HostBinding('style.animation') get getAnimation() {
    return `dToastSlideInLeft ease 0.3s, dToastFadeOut linear 1s ${
      this.options().timeout
    }s forwards`;
  }

  /**
   * Returns the Material icon name based on the toast type.
   *
   * - success → check_circle
   * - error → error
   * - warn → warning
   */
  get matFontIcon() {
    switch (this.options().type) {
      case 'success':
      case DNotificationType.Success:
        return 'check_circle';
      case 'error':
      case DNotificationType.Error:
        return 'error';
      case 'warn':
      case DNotificationType.Warn:
        return 'warning';
    }
  }
}
