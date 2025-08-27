import { Component, inject, TemplateRef } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { DNotificationOptions, DNotificationType } from '../../../models';
import { D_NOTIFICATION_INTL } from '../../../tokens/d-mat-kit-intl';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { D_NOTIFICATION_CONFIG } from '../../../tokens';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { DEFAULT_D_NOTIFICATION_INTL } from '../../../models/notification/default-notification-intl';

/**
 * A modal dialog component used to display styled notifications with animated icons.
 *
 * This component is invoked by the `DNotification` service when calling `notify(...)`.
 */
@Component({
  selector: 'd-notification-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MarkdownComponent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    NgTemplateOutlet,
  ],
  template: `
    <h2 mat-dialog-title class="d-notification-title" [class]="titleClassList">
      {{ title }}
    </h2>

    <mat-dialog-content [style.overflow]="'visible'">
      <section class="d-notification">
        @switch (type) {
        <!--prettier-ignore-->
        @case ('success') {
        <div class="d-notification-success">
          <div class="d-notification-success-tip"></div>
          <div class="d-notification-success-long"></div>
          <div class="d-notification-success-placeholder"></div>
          <div class="d-notification-success-fix"></div>
        </div>
        }
        <!--prettier-ignore-->
        @case ('error') {
        <div class="d-notification-error">
          <div class="d-notification-error-x">
            <div class="d-notification-error-left"></div>
            <div class="d-notification-error-right"></div>
          </div>
          <div class="d-notification-error-placeholder"></div>
          <div class="d-notification-error-fix"></div>
        </div>
        }
        <!--prettier-ignore-->
        @case ('warn') {
        <div class="d-notification-warn">
          <div class="d-notification-warn-body"></div>
          <div class="d-notification-warn-dot"></div>
        </div>
        } }
      </section>

      <section class="d-notification-message">
        <markdown>
          {{ message }}
        </markdown>
      </section>
    </mat-dialog-content>

    @if (showClose || actionOptions) {
    <mat-dialog-actions>
      @if (showClose) {
      <button matButton mat-dialog-close (click)="closeCallback?.()">
        {{ buttonCloseLabel }}
      </button>
      }

      <!--prettier-ignore-->
      @if (actionOptions) {
      @if (actionOptions.template) {
      <ng-container *ngTemplateOutlet="actionOptions.template"></ng-container>
      } @else {
      <button
        matButton
        mat-dialog-close
        (click)="actionOptions.callback?.()"
        cdkFocusInitial
      >
        @if (actionOptions.icon) {
        <mat-icon>{{ actionOptions.icon }}</mat-icon>
        }
        {{ buttonActionLabel }}
      </button>
      } }
    </mat-dialog-actions>
    }
  `,
  styles: [
    `
      .d-notification-title {
        &.d-notification-title-success {
          color: var(--d-notification-success-title-color);
        }

        &.d-notification-title-error {
          color: var(--d-notification-error-title-color);
        }

        &.d-notification-title-warn {
          color: var(--d-notification-warn-title-color);
        }
      }

      .d-notification {
        height: 108px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .d-notification-message {
        text-align: center;
        margin-top: 1rem;
      }
    `,
    `
      .d-notification .d-notification-success {
        border-radius: 50%;
        border: 4px solid var(--d-notification-success-icon-color);
        box-sizing: content-box;
        height: 80px;
        padding: 0;
        position: relative;
        background-color: inherit;
        width: 80px;

        &:after,
        &:before {
          background: inherit;
          content: '';
          height: 120px;
          position: absolute;
          transform: rotate(45deg);
          width: 60px;
        }

        &:before {
          border-radius: 40px 0 0 40px;
          width: 26px;
          height: 80px;
          top: -17px;
          left: 5px;
          transform-origin: 60px 60px;
          transform: rotate(-45deg);
        }

        &:after {
          border-radius: 0 120px 120px 0;
          left: 30px;
          top: -11px;
          transform-origin: 0 60px;
          transform: rotate(-45deg);
          animation: rotatePlaceholder 4.25s ease-in;
        }

        .d-notification-success-placeholder {
          border-radius: 50%;
          border: 4px solid rgba(165, 220, 134, 0.25);
          box-sizing: content-box;
          height: 80px;
          left: -4px;
          position: absolute;
          top: -4px;
          width: 80px;
          z-index: 2;
        }

        .d-notification-success-fix {
          background-color: inherit;
          height: 90px;
          left: 28px;
          position: absolute;
          top: 8px;
          transform: rotate(-45deg);
          width: 5px;
          z-index: 1;
        }

        .d-notification-success-tip,
        .d-notification-success-long {
          background-color: var(--d-notification-success-icon-color);
          border-radius: 2px;
          height: 5px;
          position: absolute;
          z-index: 2;
        }

        .d-notification-success-tip {
          left: 14px;
          top: 46px;
          transform: rotate(45deg);
          width: 25px;
          animation: animateSuccessTip 0.75s;
        }

        .d-notification-success-long {
          right: 8px;
          top: 38px;
          transform: rotate(-45deg);
          width: 47px;
          animation: animateSuccessLong 0.75s;
        }
      }

      @keyframes animateSuccessTip {
        0%,
        54% {
          width: 0;
          left: 1px;
          top: 19px;
        }

        70% {
          width: 50px;
          left: -8px;
          top: 37px;
        }

        84% {
          width: 17px;
          left: 21px;
          top: 48px;
        }

        100% {
          width: 25px;
          left: 14px;
          top: 45px;
        }
      }

      @keyframes animateSuccessLong {
        0%,
        65% {
          width: 0;
          right: 46px;
          top: 54px;
        }

        84% {
          width: 55px;
          right: 0;
          top: 35px;
        }

        100% {
          width: 47px;
          right: 8px;
          top: 38px;
        }
      }

      @keyframes rotatePlaceholder {
        0%,
        5% {
          transform: rotate(-45deg);
        }

        100%,
        12% {
          transform: rotate(-405deg);
        }
      }
    `,
    `
      .d-notification .d-notification-warn {
        border-radius: 50%;
        border: 4px solid var(--d-notification-warn-icon-color);
        box-sizing: content-box;
        height: 80px;
        padding: 0;
        position: relative;
        background-color: inherit;
        width: 80px;
        animation: scaleWarn 0.75s infinite alternate;

        &:after,
        &:before {
          background: inherit;
          content: '';
          border-radius: 50%;
          height: 100%;
          position: absolute;
          width: 100%;
        }

        &:before {
          display: inline-block;
          opacity: 0;
          animation: pulseWarn 2s linear infinite;
        }

        &:after {
          display: block;
          z-index: 1;
        }

        .d-notification-warn-body {
          background-color: var(--d-notification-warn-icon-color);
          border-radius: 2px;
          height: 47px;
          left: 50%;
          margin-left: -2px;
          position: absolute;
          top: 10px;
          width: 5px;
          z-index: 2;
          animation: pulseWarnIns 0.75s infinite alternate;
        }

        .d-notification-warn-dot {
          background-color: var(--d-notification-warn-icon-color);
          border-radius: 50%;
          bottom: 10px;
          height: 7px;
          left: 50%;
          margin-left: -3px;
          position: absolute;
          width: 7px;
          z-index: 2;
          animation: pulseWarnIns 0.75s infinite alternate;
        }
      }

      @keyframes scaleWarn {
        0% {
          transform: scale(1);
        }

        30% {
          transform: scale(1.02);
        }

        100% {
          transform: scale(1);
        }
      }

      @keyframes pulseWarn {
        0% {
          background-color: inherit;
          transform: scale(1);
          opacity: 0.5;
        }

        30% {
          background-color: inherit;
          transform: scale(1);
          opacity: 0.5;
        }

        100% {
          background-color: var(--d-notification-warn-icon-color);
          transform: scale(2);
          opacity: 0;
        }
      }

      @keyframes pulseWarnIns {
        0% {
          background-color: #f8d486;
        }

        100% {
          background-color: var(--d-notification-warn-icon-color);
        }
      }
    `,
    `
      .d-notification .d-notification-error {
        border-radius: 50%;
        border: 4px solid var(--d-notification-error-icon-color);
        box-sizing: content-box;
        height: 80px;
        padding: 0;
        position: relative;
        background-color: inherit;
        width: 80px;
        animation: animateErrorIcon 0.5s;

        &:after,
        &:before {
          background: inherit;
          content: '';
          height: 120px;
          position: absolute;
          transform: rotate(45deg);
          width: 60px;
        }

        &:before {
          border-radius: 40px 0 0 40px;
          width: 26px;
          height: 80px;
          top: -17px;
          left: 5px;
          transform-origin: 60px 60px;
          transform: rotate(-45deg);
        }

        &:after {
          border-radius: 0 120px 120px 0;
          left: 30px;
          top: -11px;
          transform-origin: 0 60px;
          transform: rotate(-45deg);
          animation: rotatePlaceholder 4.25s ease-in;
        }

        .d-notification-error-x {
          display: block;
          position: relative;
          z-index: 2;
        }

        .d-notification-error-placeholder {
          border-radius: 50%;
          border: 4px solid rgba(200, 0, 0, 0.2);
          box-sizing: content-box;
          height: 80px;
          left: -4px;
          position: absolute;
          top: -4px;
          width: 80px;
          z-index: 2;
        }

        .d-notification-error-fix {
          background-color: inherit;
          height: 90px;
          left: 28px;
          position: absolute;
          top: 8px;
          transform: rotate(-45deg);
          width: 5px;
          z-index: 1;
        }

        .d-notification-error-left,
        .d-notification-error-right {
          border-radius: 2px;
          display: block;
          height: 5px;
          position: absolute;
          z-index: 2;
          background-color: var(--d-notification-error-icon-color);
          top: 37px;
          width: 47px;
        }

        .d-notification-error-left {
          left: 17px;
          transform: rotate(45deg);
          animation: animateXLeft 0.75s;
        }

        .d-notification-error-right {
          right: 16px;
          transform: rotate(-45deg);
          animation: animateXRight 0.75s;
        }
      }

      @keyframes animateErrorIcon {
        0% {
          transform: rotateX(100deg);
          opacity: 0;
        }

        100% {
          transform: rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes animateXLeft {
        0%,
        65% {
          left: 82px;
          top: 95px;
          width: 0;
        }

        84% {
          left: 14px;
          top: 33px;
          width: 47px;
        }

        100% {
          left: 17px;
          top: 37px;
          width: 47px;
        }
      }

      @keyframes animateXRight {
        0%,
        65% {
          right: 82px;
          top: 95px;
          width: 0;
        }

        84% {
          right: 14px;
          top: 33px;
          width: 47px;
        }

        100% {
          right: 16px;
          top: 37px;
          width: 47px;
        }
      }
    `,
  ],
  providers: [provideMarkdown()],
})
export class DNotificationDialog {
  private readonly _intl = inject(D_NOTIFICATION_INTL);
  private readonly _config = inject(D_NOTIFICATION_CONFIG);

  /** Title text to display in the notification dialog */
  readonly title: string;
  /**
   * CSS class list for styling the title based on the type of notification.
   * Includes custom class (if provided) and default type class.
   */
  readonly titleClassList: string;
  /** Type of the notification: determines icon and styling (success, error, warn) */
  readonly type: DNotificationType;
  /** Markdown-supported message content to be shown in the notification body */
  readonly message: string;
  /** Label for the close button; defaults to 'Close' or value from `DNotificationIntl` */
  readonly buttonCloseLabel: string;
  /** Label for the action button; resolved from action label, intl token, or default 'Confirm' */
  readonly buttonActionLabel: string;
  /** Whether to show the close button; resolved from options or config */
  readonly showClose: boolean;
  /**
   * Configuration object for the optional action button or template.
   * - `label`: Button label text
   * - `callback`: Function to call when the button is clicked
   * - `icon`: Optional icon to show
   * - `template`: If provided, overrides default button with a custom `TemplateRef`
   */
  readonly actionOptions:
    | {
        label?: string;
        callback?: () => void;
        icon?: string;
        template?: TemplateRef<any>;
      }
    | undefined;
  /**
   * Optional callback to invoke when the close button is clicked.
   * Note: This does **not** fire when the dialog auto-closes.
   */
  readonly closeCallback: (() => void) | undefined;

  constructor() {
    const options = inject(MAT_DIALOG_DATA) as DNotificationOptions;

    this.title = options.title || this.getDefaultTitle(options);
    this.titleClassList = [
      options.titleClass || '',
      `d-notification-title-${options.type}`,
    ].join(' ');

    this.type = options.type as DNotificationType;
    this.message = options.message;
    this.buttonCloseLabel =
      this._intl.buttonCloseLabel ||
      DEFAULT_D_NOTIFICATION_INTL.buttonCloseLabel;
    this.buttonActionLabel =
      options.action?.label ||
      this._intl.buttonActionLabel ||
      DEFAULT_D_NOTIFICATION_INTL.buttonActionLabel;
    this.showClose = !!(options.showClose ?? this._config.showClose);
    this.actionOptions = options.action;
    this.closeCallback = options.onCloseClick;
  }

  private getDefaultTitle(options: DNotificationOptions): string {
    switch (options.type) {
      case DNotificationType.Success:
        return (
          this._intl.titleSuccess || DEFAULT_D_NOTIFICATION_INTL.titleSuccess
        );
      case DNotificationType.Error:
        return this._intl.titleError || DEFAULT_D_NOTIFICATION_INTL.titleError;
      case DNotificationType.Warn:
        return this._intl.titleWarn || DEFAULT_D_NOTIFICATION_INTL.titleWarn;
      default:
        return '';
    }
  }
}
