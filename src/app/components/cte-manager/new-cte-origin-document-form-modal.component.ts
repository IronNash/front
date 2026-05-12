import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ORIGIN_DOCUMENT_TYPE_OPTIONS,
  type NewCteDocumentId,
  type NewCteOriginDocumentFormPayload,
  type OriginDocumentKindId,
  defaultOriginDocumentKindFromPath,
} from './cte-manager.models';
import { brlPositiveAmountValidator } from './validators/brl-amount.validator';
import { BrlCurrencyBlurFormatDirective } from '../ui/brl-currency-blur-format.directive';
import { CteModalShellComponent } from '../ui/cte-modal-shell.component';
import { FieldHintIconComponent } from '../ui/field-hint-icon.component';

/**
 * “Informe os dados do documento” — used after non–NF-e paths when the user must describe the paper / third-party document.
 * Uses reactive forms for validation and for a clear path to async / server-side errors later.
 */
@Component({
  selector: 'app-new-cte-origin-document-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CteModalShellComponent,
    FieldHintIconComponent,
    BrlCurrencyBlurFormatDirective,
  ],
  templateUrl: './new-cte-origin-document-form-modal.component.html',
})
export class NewCteOriginDocumentFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  /** Which “Novo CTe” card opened this form (used only to preselect the dropdown). */
  readonly pathContext = input<NewCteDocumentId | null>(null);

  readonly modalClosed = output<void>();
  readonly helpRequested = output<void>();
  readonly documentSubmitted = output<NewCteOriginDocumentFormPayload>();

  readonly originTypeOptions = ORIGIN_DOCUMENT_TYPE_OPTIONS;

  /** True after the user clicks Adicionar with invalid fields — drives error hints without touching controls early. */
  readonly submitAttempted = signal(false);

  readonly form = this.fb.nonNullable.group({
    originDocumentKindId: this.fb.nonNullable.control<OriginDocumentKindId>('other-documents', {
      validators: [Validators.required],
    }),
    description: ['', [Validators.required]],
    documentNumber: [''],
    documentValue: ['', [Validators.required, brlPositiveAmountValidator]],
    issueDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      const path = this.pathContext();
      untracked(() => {
        this.submitAttempted.set(false);
        const kind: OriginDocumentKindId = path ? defaultOriginDocumentKindFromPath(path) : 'other-documents';
        this.form.reset({
          originDocumentKindId: kind,
          description: '',
          documentNumber: '',
          documentValue: '',
          issueDate: '',
        });
        this.form.markAsPristine();
        this.form.markAsUntouched();
      });
    });
  }

  onBackdropDismiss(): void {
    this.modalClosed.emit();
  }

  onCloseRequested(): void {
    this.modalClosed.emit();
  }

  requestHelp(): void {
    this.helpRequested.emit();
  }

  onSubmit(): void {
    this.submitAttempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    this.documentSubmitted.emit({
      originDocumentKindId: v.originDocumentKindId,
      description: v.description.trim(),
      documentNumber: v.documentNumber.trim(),
      documentValueInput: v.documentValue.trim(),
      issueDateIso: v.issueDate.trim(),
    });
  }

  showFieldError(controlName: 'description' | 'documentValue' | 'issueDate'): boolean {
    const c = this.form.controls[controlName];
    return c.invalid && (c.touched || this.submitAttempted());
  }
}
