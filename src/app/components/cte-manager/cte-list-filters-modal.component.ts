import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { CteRow } from '../../dashboard.models';
import type { CteFilters, CtePeriodPreset } from './cte-manager.models';
import { PERIOD_OPTIONS, createEmptyFilters } from './cte-manager.models';
import { prefixSuggestions, uniqueValues, parseIsoDateLocal } from './cte-list-filter.utils';

/**
 * Modal for filtering the **issued CTe list** (not part of the “Novo CTe” intake flow).
 */
import { CteModalShellComponent } from '../ui/cte-modal-shell.component';

@Component({
  selector: 'app-cte-list-filters-modal',
  standalone: true,
  imports: [CteModalShellComponent],
  templateUrl: './cte-list-filters-modal.component.html',
})
export class CteListFiltersModalComponent {
  readonly open = input(false);
  readonly rows = input<CteRow[]>([]);
  readonly appliedSnapshot = input.required<CteFilters>();

  readonly savedFilters = output<CteFilters>();
  readonly modalClosed = output<void>();

  readonly draftFilters = signal<CteFilters>(createEmptyFilters());
  readonly autocompleteOpen = signal<'customer' | 'sender' | 'recipient' | null>(null);
  readonly isCustomDateModalOpen = signal(false);
  readonly draftCustomStart = signal('');
  readonly draftCustomEnd = signal('');
  readonly periodApplyError = signal(false);

  readonly periodOptions = PERIOD_OPTIONS;

  readonly statusOptions = computed(() => uniqueValues(this.rows().map((row) => row.status)));
  readonly typeOptions = computed(() => uniqueValues(this.rows().map((row) => row.type)));
  readonly financialStatusOptions = computed(() => uniqueValues(this.rows().map((row) => row.financialStatus)));

  readonly customerSuggestions = computed(() =>
    prefixSuggestions(this.rows().map((r) => r.customer), this.draftFilters().customer)
  );
  readonly senderSuggestions = computed(() =>
    prefixSuggestions(this.rows().map((r) => r.remetente), this.draftFilters().remetente)
  );
  readonly recipientSuggestions = computed(() =>
    prefixSuggestions(this.rows().map((r) => r.destinatario), this.draftFilters().destinatario)
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        const snap = { ...this.appliedSnapshot() };
        untracked(() => {
          this.draftFilters.set(snap);
          this.autocompleteOpen.set(null);
          this.periodApplyError.set(false);
          this.isCustomDateModalOpen.set(false);
        });
      }
    });
  }

  onBackdropClick(): void {
    this.tryCloseMainModal();
  }

  tryCloseMainModal(): void {
    if (this.isCustomDateModalOpen()) {
      this.cancelCustomDateModal();
      return;
    }
    this.modalClosed.emit();
  }

  closeViaButton(): void {
    this.tryCloseMainModal();
  }

  updateDraftFilter(field: keyof CteFilters, value: string | boolean): void {
    this.draftFilters.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  toggleAdvancedFilters(enabled: boolean): void {
    this.draftFilters.update((f) => ({
      ...f,
      advancedEnabled: enabled,
      ...(enabled
        ? {}
        : {
            financialStatus: '',
            cteType: '',
            numberFrom: '',
            numberTo: '',
            nfNumber: '',
            remetente: '',
            destinatario: '',
          }),
    }));
  }

  setAutocompleteOpen(field: 'customer' | 'sender' | 'recipient' | null): void {
    this.autocompleteOpen.set(field);
  }

  onAutocompleteHostFocusOut(event: FocusEvent, field: 'customer' | 'sender' | 'recipient'): void {
    const next = event.relatedTarget as Node | null;
    const root = event.currentTarget as HTMLElement | null;
    if (root && next && root.contains(next)) {
      return;
    }
    if (this.autocompleteOpen() === field) {
      this.autocompleteOpen.set(null);
    }
  }

  pickAutocompleteSuggestion(field: 'customer' | 'sender' | 'recipient', value: string): void {
    const key = field === 'customer' ? 'customer' : field === 'sender' ? 'remetente' : 'destinatario';
    this.updateDraftFilter(key, value);
    this.autocompleteOpen.set(null);
  }

  onPeriodChange(nextPreset: string): void {
    const preset = nextPreset as CtePeriodPreset;
    this.periodApplyError.set(false);

    this.draftFilters.update((current) => ({
      ...current,
      periodPreset: preset,
      ...(preset !== 'personalizado' ? { customStart: '', customEnd: '' } : {}),
    }));

    if (preset === 'personalizado') {
      this.openCustomDateModal();
    }
  }

  openCustomDateModal(): void {
    const { customStart, customEnd } = this.draftFilters();
    this.draftCustomStart.set(customStart);
    this.draftCustomEnd.set(customEnd);
    this.isCustomDateModalOpen.set(true);
  }

  saveCustomDateRange(): void {
    const start = this.draftCustomStart().trim();
    const end = this.draftCustomEnd().trim();
    if (!start || !end) {
      return;
    }
    const startTime = parseIsoDateLocal(start);
    const endTime = parseIsoDateLocal(end);
    if (!startTime || !endTime || startTime > endTime) {
      return;
    }

    this.draftFilters.update((f) => ({
      ...f,
      periodPreset: 'personalizado',
      customStart: start,
      customEnd: end,
    }));
    this.isCustomDateModalOpen.set(false);
  }

  cancelCustomDateModal(): void {
    const { customStart, customEnd, periodPreset } = this.draftFilters();
    const hadSavedRange = Boolean(customStart && customEnd);
    this.isCustomDateModalOpen.set(false);
    if (periodPreset === 'personalizado' && !hadSavedRange) {
      this.draftFilters.update((f) => ({ ...f, periodPreset: '', customStart: '', customEnd: '' }));
    }
  }

  clearAll(): void {
    this.draftFilters.set(createEmptyFilters());
    this.periodApplyError.set(false);
    this.draftCustomStart.set('');
    this.draftCustomEnd.set('');
    this.isCustomDateModalOpen.set(false);
    this.autocompleteOpen.set(null);
    this.savedFilters.emit(createEmptyFilters());
  }

  apply(): void {
    const draft = this.draftFilters();
    if (draft.periodPreset === 'personalizado' && (!draft.customStart || !draft.customEnd)) {
      this.periodApplyError.set(true);
      return;
    }
    this.periodApplyError.set(false);
    const sanitized: CteFilters = draft.advancedEnabled
      ? draft
      : {
          ...draft,
          financialStatus: '',
          cteType: '',
          numberFrom: '',
          numberTo: '',
          nfNumber: '',
          remetente: '',
          destinatario: '',
        };
    this.isCustomDateModalOpen.set(false);
    this.autocompleteOpen.set(null);
    this.savedFilters.emit(sanitized);
  }
}
