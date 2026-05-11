import { Component, computed, input, signal } from '@angular/core';
import { CteRow } from '../../dashboard.models';

/** Matches the preset values used in `periodOptions` (`value`). */
type CtePeriodPreset = '' | 'hoje' | 'este-mes' | 'mes-anterior' | 'personalizado';

type CteFilters = {
  periodPreset: CtePeriodPreset;
  /** `yyyy-mm-dd` from `<input type="date">`; only used when preset is personalizado */
  customStart: string;
  customEnd: string;
  status: string;
  /** Tomador: texto livre + sugestões (não é `<select>`). */
  customer: string;
  financialStatus: string;
  advancedEnabled: boolean;
  cteType: string;
  numberFrom: string;
  numberTo: string;
  nfNumber: string;
  remetente: string;
  destinatario: string;
};

const createEmptyFilters = (): CteFilters => ({
  periodPreset: '',
  customStart: '',
  customEnd: '',
  status: '',
  customer: '',
  financialStatus: '',
  advancedEnabled: false,
  cteType: '',
  numberFrom: '',
  numberTo: '',
  nfNumber: '',
  remetente: '',
  destinatario: '',
});

@Component({
  selector: 'app-cte-manager',
  standalone: true,
  templateUrl: './cte-manager.component.html',
})
export class CteManagerComponent {
  readonly rows = input<CteRow[]>([]);

  readonly searchTerm = signal('');
  readonly isFilterModalOpen = signal(false);
  readonly appliedFilters = signal<CteFilters>(createEmptyFilters());
  readonly draftFilters = signal<CteFilters>(createEmptyFilters());

  /** Qual campo de autocomplete está com foco no modal (lista de sugestões). */
  readonly autocompleteOpen = signal<'customer' | 'sender' | 'recipient' | null>(null);

  /** Second-level modal for "Personalizado" date range */
  readonly isCustomDateModalOpen = signal(false);
  readonly draftCustomStart = signal('');
  readonly draftCustomEnd = signal('');

  /** Exibido sob Período quando "Filtrar" é acionado sem intervalo personalizado válido. */
  readonly periodApplyError = signal(false);

  readonly periodOptions = [
    { value: '' as const, label: 'Selecione um período' },
    { value: 'hoje' as const, label: 'Hoje' },
    { value: 'este-mes' as const, label: 'Este mês' },
    { value: 'mes-anterior' as const, label: 'Mês anterior' },
    { value: 'personalizado' as const, label: 'Personalizado' },
  ];

  readonly statusOptions = computed(() => this.uniqueValues(this.rows().map((row) => row.status)));
  readonly typeOptions = computed(() => this.uniqueValues(this.rows().map((row) => row.type)));
  readonly financialStatusOptions = computed(() =>
    this.uniqueValues(this.rows().map((row) => row.financialStatus))
  );

  readonly customerSuggestions = computed(() =>
    this.prefixSuggestions(this.rows().map((r) => r.customer), this.draftFilters().customer)
  );
  readonly senderSuggestions = computed(() =>
    this.prefixSuggestions(this.rows().map((r) => r.remetente), this.draftFilters().remetente)
  );
  readonly recipientSuggestions = computed(() =>
    this.prefixSuggestions(this.rows().map((r) => r.destinatario), this.draftFilters().destinatario)
  );

  readonly hasActiveFilters = computed(() => {
    const f = this.appliedFilters();
    return (
      f.periodPreset !== '' ||
      f.status !== '' ||
      f.customer !== '' ||
      f.advancedEnabled ||
      f.financialStatus !== '' ||
      f.cteType !== '' ||
      f.numberFrom !== '' ||
      f.numberTo !== '' ||
      f.nfNumber !== '' ||
      f.remetente !== '' ||
      f.destinatario !== ''
    );
  });

  readonly filteredRows = computed(() =>
    this.rows().filter((row) => this.matchesSearchTerm(row) && this.matchesAdvancedFilters(row))
  );

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  openFilterModal(): void {
    this.periodApplyError.set(false);
    this.draftFilters.set(this.appliedFilters());
    this.autocompleteOpen.set(null);
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    if (this.isCustomDateModalOpen()) {
      this.cancelCustomDateModal();
      return;
    }
    this.isFilterModalOpen.set(false);
    this.periodApplyError.set(false);
    this.autocompleteOpen.set(null);
  }

  onMainBackdropClick(): void {
    this.closeFilterModal();
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
    const startTime = this.parseIsoDateLocal(start);
    const endTime = this.parseIsoDateLocal(end);
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

  clearModalFilters(): void {
    this.draftFilters.set(createEmptyFilters());
    this.appliedFilters.set(createEmptyFilters());
    this.periodApplyError.set(false);
    this.draftCustomStart.set('');
    this.draftCustomEnd.set('');
    this.isCustomDateModalOpen.set(false);
    this.autocompleteOpen.set(null);
  }

  applyModalFilters(): void {
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
    this.appliedFilters.set(sanitized);
    this.isCustomDateModalOpen.set(false);
    this.isFilterModalOpen.set(false);
    this.autocompleteOpen.set(null);
  }

  /**
   * Busca rapida: texto em qualquer coluna relevante.
   * Para valor em BRL, não usamos substring só de dígitos (evita "1050" casar com "10,50").
   * Em vez disso, comparamos **centavos** quando a busca parece um valor monetario.
   */
  private matchesSearchTerm(row: CteRow): boolean {
    const raw = this.searchTerm().trim();
    if (!raw) {
      return true;
    }

    const normalizedQuery = this.normalizeText(raw);
    const combinedText = this.normalizeText(
      [
        row.emission,
        row.number,
        row.type,
        row.customer,
        row.route,
        row.value,
        row.status,
        row.financialStatus,
        row.nfNumber,
        row.remetente,
        row.destinatario,
      ].join(' ')
    );
    const textHit = combinedText.includes(normalizedQuery);

    const queryCents = this.tryParseMoneyQueryToCentavos(raw);
    const rowValueCents = this.parseBrlToCentavos(row.value);
    const moneyHit = queryCents !== null && rowValueCents !== null && queryCents === rowValueCents;

    return textHit || moneyHit;
  }

  private matchesAdvancedFilters(row: CteRow): boolean {
    const filters = this.appliedFilters();
    const emissionDate = this.parseDdMmYyyy(row.emission);

    if (filters.periodPreset) {
      if (!emissionDate) {
        return false;
      }
      if (!this.matchesPeriodPreset(emissionDate, filters)) {
        return false;
      }
    }

    if (filters.status && row.status !== filters.status) {
      return false;
    }

    if (filters.customer) {
      const q = this.normalizeText(filters.customer);
      if (!this.normalizeText(row.customer).includes(q)) {
        return false;
      }
    }

    if (!filters.advancedEnabled) {
      return true;
    }

    if (filters.financialStatus && row.financialStatus !== filters.financialStatus) {
      return false;
    }

    if (filters.cteType && row.type !== filters.cteType) {
      return false;
    }

    const rowNum = Number.parseInt(row.number, 10);
    if (filters.numberFrom) {
      const from = Number.parseInt(filters.numberFrom, 10);
      if (!Number.isFinite(rowNum) || !Number.isFinite(from) || rowNum < from) {
        return false;
      }
    }
    if (filters.numberTo) {
      const to = Number.parseInt(filters.numberTo, 10);
      if (!Number.isFinite(rowNum) || !Number.isFinite(to) || rowNum > to) {
        return false;
      }
    }

    if (filters.nfNumber) {
      const q = this.normalizeText(filters.nfNumber);
      if (!this.normalizeText(row.nfNumber).includes(q)) {
        return false;
      }
    }

    if (filters.remetente) {
      const q = this.normalizeText(filters.remetente);
      if (!this.normalizeText(row.remetente).includes(q)) {
        return false;
      }
    }

    if (filters.destinatario) {
      const q = this.normalizeText(filters.destinatario);
      if (!this.normalizeText(row.destinatario).includes(q)) {
        return false;
      }
    }

    return true;
  }

  private matchesPeriodPreset(emissionDate: Date, filters: CteFilters): boolean {
    const today = this.startOfDay(new Date());

    switch (filters.periodPreset) {
      case 'hoje':
        return this.isSameCalendarDay(emissionDate, today);
      case 'este-mes':
        return (
          emissionDate.getFullYear() === today.getFullYear() && emissionDate.getMonth() === today.getMonth()
        );
      case 'mes-anterior': {
        const ref = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return (
          emissionDate.getFullYear() === ref.getFullYear() && emissionDate.getMonth() === ref.getMonth()
        );
      }
      case 'personalizado': {
        const start = this.parseIsoDateLocal(filters.customStart);
        const end = this.parseIsoDateLocal(filters.customEnd);
        if (!start || !end) {
          return false;
        }
        const e = this.startOfDay(emissionDate);
        return e >= this.startOfDay(start) && e <= this.startOfDay(end);
      }
      default:
        return true;
    }
  }

  private prefixSuggestions(source: string[], typed: string): string[] {
    const unique = this.uniqueValues(source);
    const q = this.normalizeText(typed);
    const max = 10;
    if (!q) {
      return unique.slice(0, max);
    }
    return unique.filter((item) => this.normalizeText(item).startsWith(q)).slice(0, max);
  }

  private uniqueValues(values: string[]): string[] {
    return [...new Set(values)];
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Interpreta texto como valor em BRL e devolve **centavos** (inteiro).
   * Regra: ultima virgula separa centavos; pontos sao milhar. Sem virgula = reais inteiros (ex.: "1100" => 110000 centavos).
   */
  private parseBrlToCentavos(value: string): number | null {
    const cleaned = value
      .replace(/R\$\s*/gi, '')
      .replace(/\s/g, '')
      .trim();
    if (!cleaned) {
      return null;
    }
    if (!/^[\d.,]+$/.test(cleaned)) {
      return null;
    }

    const lastComma = cleaned.lastIndexOf(',');
    let intRaw: string;
    let frac = '00';
    if (lastComma !== -1) {
      intRaw = cleaned.slice(0, lastComma).replace(/\./g, '');
      const fracRaw = cleaned.slice(lastComma + 1).replace(/\D/g, '');
      frac = (fracRaw + '00').slice(0, 2);
    } else {
      intRaw = cleaned.replace(/\./g, '');
    }

    if (!intRaw || !/^\d+$/.test(intRaw) || !/^\d{1,2}$/.test(frac)) {
      return null;
    }

    const intPart = Number(intRaw);
    const fracNum = Number(frac);
    if (!Number.isFinite(intPart) || !Number.isFinite(fracNum)) {
      return null;
    }

    return intPart * 100 + fracNum;
  }

  /** Só aplica comparação monetária se a busca parecer um valor (dígitos / BRL), não texto misto. */
  private tryParseMoneyQueryToCentavos(raw: string): number | null {
    const stripped = raw.trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
    if (!stripped || !/^[\d.,]+$/.test(stripped)) {
      return null;
    }
    return this.parseBrlToCentavos(stripped);
  }

  private parseDdMmYyyy(value: string): Date | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) {
      return null;
    }
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const d = new Date(year, month, day);
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
      return null;
    }
    return d;
  }

  private parseIsoDateLocal(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) {
      return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const d = new Date(year, month, day);
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
      return null;
    }
    return d;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
