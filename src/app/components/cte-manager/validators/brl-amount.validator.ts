import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { parseBrlToCentavos } from '../cte-list-filter.utils';

/** Requires a parseable BRL string with a strictly positive monetary value. */
export const brlPositiveAmountValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const cents = parseBrlToCentavos(String(control.value ?? '').trim());
  if (cents === null || cents <= 0) {
    return { brlPositiveAmount: true };
  }
  return null;
};
