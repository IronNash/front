import { Component, input } from '@angular/core';

/** Small “i” hint next to a label; uses native tooltip via `title`. */
@Component({
  selector: 'app-field-hint-icon',
  standalone: true,
  template: `
    <span
      class="inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[0.65rem] font-bold leading-none text-slate-500"
      [attr.title]="hint()"
      role="img"
      [attr.aria-label]="hint()"
    >
      i
    </span>
  `,
})
export class FieldHintIconComponent {
  readonly hint = input.required<string>();
}
