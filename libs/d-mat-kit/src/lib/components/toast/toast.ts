import { Component, input } from '@angular/core';
import { DToastOptions } from '../../models';
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
        background-color: var(--mat-sys-error-container);
      }
    `,
  ],
  providers: [provideMarkdown()],
})
export class Toast {
  options = input.required<DToastOptions>();
}
