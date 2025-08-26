import { Component, input } from '@angular/core';
import { DToastOptions } from '../../../models';
import { provideMarkdown, MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'd-toast',
  imports: [MarkdownComponent],
  template: `
    <markdown>
      {{ options().message }}
    </markdown>
  `,
  styles: [
    `
      :host {
        width: fit-content;
        height: fit-content;
        min-width: 280px;
        background-color: var(--mat-sys-error-container);
        animation: slideInLeft ease 0.3s;
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(calc(100% + 16px)) scale(0);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
    `,
  ],
  providers: [provideMarkdown()],
})
export class Toast {
  options = input.required<DToastOptions>();
}
