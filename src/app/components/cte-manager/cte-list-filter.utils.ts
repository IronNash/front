/**
 * Pure helpers for the issued CTe list (quick search + advanced filters).
 * Keeps matching rules testable and out of the component class.
 */
import { CteRow } from '../../dashboard.models';
import type { CteFilters } from './cte-manager.models';

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

export function prefixSuggestions(source: string[], typed: string): string[] {
  const unique = uniqueValues(source);
  const q = normalizeText(typed);
  const max = 10;
  if (!q) {
    return unique.slice(0, max);
  }
  return unique.filter((item) => normalizeText(item).startsWith(q)).slice(0, max);
}

/**
 * Interpreta texto como valor em BRL e devolve **centavos** (inteiro).
 * Regra: ultima virgula separa centavos; pontos sao milhar. Sem virgula = reais inteiros (ex.: "1100" => 110000 centavos).
 */
export function parseBrlToCentavos(value: string): number | null {
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

/** Formats centavos as `R$ 1.234,56` (pt-BR grouping). Used after blur on currency fields. */
export function formatCentsAsBrl(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) {
    return 'R$ 0,00';
  }
  const intPart = Math.floor(cents / 100);
  const frac = cents % 100;
  const intFormatted = intPart.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return `R$ ${intFormatted},${frac.toString().padStart(2, '0')}`;
}

/** Só aplica comparação monetária se a busca parecer um valor (dígitos / BRL), não texto misto. */
export function tryParseMoneyQueryToCentavos(raw: string): number | null {
  const stripped = raw.trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
  if (!stripped || !/^[\d.,]+$/.test(stripped)) {
    return null;
  }
  return parseBrlToCentavos(stripped);
}

export function parseDdMmYyyy(value: string): Date | null {
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

export function parseIsoDateLocal(value: string): Date | null {
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

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function matchesPeriodPreset(emissionDate: Date, filters: CteFilters): boolean {
  const today = startOfDay(new Date());

  switch (filters.periodPreset) {
    case 'hoje':
      return isSameCalendarDay(emissionDate, today);
    case 'este-mes':
      return emissionDate.getFullYear() === today.getFullYear() && emissionDate.getMonth() === today.getMonth();
    case 'mes-anterior': {
      const ref = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return emissionDate.getFullYear() === ref.getFullYear() && emissionDate.getMonth() === ref.getMonth();
    }
    case 'personalizado': {
      const start = parseIsoDateLocal(filters.customStart);
      const end = parseIsoDateLocal(filters.customEnd);
      if (!start || !end) {
        return false;
      }
      const e = startOfDay(emissionDate);
      return e >= startOfDay(start) && e <= startOfDay(end);
    }
    default:
      return true;
  }
}

/** Filtro só por período (útil em MDFe / totalizadores sem montar um `CteRow` completo). */
export function rowMatchesPeriod(
  emissionDdMmYyyy: string,
  period: Pick<CteFilters, 'periodPreset' | 'customStart' | 'customEnd'>
): boolean {
  if (!period.periodPreset) {
    return true;
  }
  const emissionDate = parseDdMmYyyy(emissionDdMmYyyy);
  if (!emissionDate) {
    return false;
  }
  const filters = period as CteFilters;
  return matchesPeriodPreset(emissionDate, filters);
}

export function matchesAdvancedFilters(row: CteRow, filters: CteFilters): boolean {
  const emissionDate = parseDdMmYyyy(row.emission);

  if (filters.periodPreset) {
    if (!emissionDate) {
      return false;
    }
    if (!matchesPeriodPreset(emissionDate, filters)) {
      return false;
    }
  }

  if (filters.status && row.status !== filters.status) {
    return false;
  }

  if (filters.customer) {
    const q = normalizeText(filters.customer);
    if (!normalizeText(row.customer).includes(q)) {
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
    const q = normalizeText(filters.nfNumber);
    if (!normalizeText(row.nfNumber).includes(q)) {
      return false;
    }
  }

  if (filters.remetente) {
    const q = normalizeText(filters.remetente);
    if (!normalizeText(row.remetente).includes(q)) {
      return false;
    }
  }

  if (filters.destinatario) {
    const q = normalizeText(filters.destinatario);
    if (!normalizeText(row.destinatario).includes(q)) {
      return false;
    }
  }

  return true;
}

/**
 * Busca rapida: texto em qualquer coluna relevante.
 * Para valor em BRL, comparamos **centavos** quando a busca parece um valor monetario.
 */
export function matchesSearchTerm(row: CteRow, rawSearch: string): boolean {
  const raw = rawSearch.trim();
  if (!raw) {
    return true;
  }

  const normalizedQuery = normalizeText(raw);
  const combinedText = normalizeText(
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

  const queryCents = tryParseMoneyQueryToCentavos(raw);
  const rowValueCents = parseBrlToCentavos(row.value);
  const moneyHit = queryCents !== null && rowValueCents !== null && queryCents === rowValueCents;

  return textHit || moneyHit;
}

export function filterCteRows(rows: CteRow[], searchTerm: string, appliedFilters: CteFilters): CteRow[] {
  return rows.filter(
    (row) => matchesSearchTerm(row, searchTerm) && matchesAdvancedFilters(row, appliedFilters)
  );
}
