import type { CtePeriodPreset } from './components/cte-manager/cte-manager.models';
import { PERIOD_OPTIONS } from './components/cte-manager/cte-manager.models';
import { formatCentsAsBrl, parseBrlToCentavos, rowMatchesPeriod } from './components/cte-manager/cte-list-filter.utils';
import type { CteRow, MdfeRow } from './dashboard.models';

/** Mesmos valores de período do modal CTe; o primeiro item é “Todos” (sem filtro de data). */
export const HOME_PERIOD_SELECT_OPTIONS: { value: CtePeriodPreset; label: string }[] = [
  { value: '', label: 'Todos' },
  ...PERIOD_OPTIONS.filter((o) => o.value !== ''),
];

export type ShellCtePeriodSlice = {
  preset: CtePeriodPreset;
  customStart: string;
  customEnd: string;
};

export type DashboardTotals = {
  cteAutorizadosManifestados: number;
  cteAutorizadosNaoManifestados: number;
  mdfeAutorizadosEncerrados: number;
  mdfeAutorizadosNaoEncerrados: number;
  valorCtesManifestadosFormatado: string;
};

export function computeDashboardTotals(
  cteRows: readonly CteRow[],
  mdfeRows: readonly MdfeRow[],
  period: ShellCtePeriodSlice
): DashboardTotals {
  const periodPick = {
    periodPreset: period.preset,
    customStart: period.customStart,
    customEnd: period.customEnd,
  };

  const ctes = cteRows.filter((r) => rowMatchesPeriod(r.emission, periodPick));
  const mdfes = mdfeRows.filter((r) => rowMatchesPeriod(r.emission, periodPick));

  const manifestados = ctes.filter((r) => r.status === 'Manifestado');
  const cteAutorizadosManifestados = manifestados.length;
  const cteAutorizadosNaoManifestados = ctes.filter((r) => r.status === 'Autorizado').length;

  const mdfeAutorizadosEncerrados = mdfes.filter((r) => r.status === 'Encerrado').length;
  const mdfeAutorizadosNaoEncerrados = mdfes.filter((r) => r.status === 'Autorizado').length;

  let cents = 0;
  for (const row of manifestados) {
    const v = parseBrlToCentavos(row.value);
    if (v !== null) {
      cents += v;
    }
  }

  return {
    cteAutorizadosManifestados,
    cteAutorizadosNaoManifestados,
    mdfeAutorizadosEncerrados,
    mdfeAutorizadosNaoEncerrados,
    valorCtesManifestadosFormatado: formatCentsAsBrl(cents),
  };
}
