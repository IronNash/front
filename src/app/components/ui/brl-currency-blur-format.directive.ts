import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatCentsAsBrl, parseBrlToCentavos } from '../cte-manager/cte-list-filter.utils';

/**
 * On blur, normalizes a valid positive BRL amount to {@link formatCentsAsBrl} display.
 * Keeps typing free on focus; validation still uses {@link parseBrlToCentavos} on the same string rules.
 */
@Directive({
  selector: 'input[appBrlCurrencyBlurFormat]',
  standalone: true,
  host: {
    '(blur)': 'onBlur()',
  },
})
export class BrlCurrencyBlurFormatDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly ngControl = inject(NgControl, { self: true, optional: true });

  onBlur(): void {
    const raw = this.el.nativeElement.value.trim();
    if (!raw) {
      return;
    }
    const cents = parseBrlToCentavos(raw);
    if (cents === null || cents <= 0) {
      return;
    }
    const formatted = formatCentsAsBrl(cents);
    this.el.nativeElement.value = formatted;
    this.ngControl?.control?.setValue(formatted, { emitEvent: true });
  }
}
