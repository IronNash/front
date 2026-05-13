import { Component, HostListener, input, output, signal } from '@angular/core';
import { ReportTab } from '../../dashboard.models';
import {
  REPORT_DATE_PRESET_OPTIONS,
  REPORT_MOTORISTA_OPTIONS,
  REPORT_PLACA_OPTIONS,
  REPORT_TOMADOR_OPTIONS,
  type ReportDatePreset,
} from '../../reports.config';

type ReportMultiselectId = 'cte-tomador' | 'cargas-tomador' | 'mdfe-motorista' | 'mdfe-placa';

/**
 * Relatórios: filtros e colunas em demo local (signals).
 * Estado de colunas continua no pai (`App`) para manter o mesmo contrato de I/O.
 */
@Component({
  selector: 'app-reports-manager',
  standalone: true,
  templateUrl: './reports-manager.component.html',
})
export class ReportsManagerComponent {
  readonly reportTabs = input<ReportTab[]>([]);
  readonly activeReportTab = input<ReportTab>('CTe');
  readonly reportColumns = input<string[]>([]);
  readonly selectedReportColumns = input<string[]>([]);

  readonly activeReportTabChange = output<ReportTab>();
  readonly toggleReportColumn = output<string>();
  readonly selectAllReportColumns = output<void>();

  readonly datePresetOptions = REPORT_DATE_PRESET_OPTIONS;
  readonly tomadorOptions = REPORT_TOMADOR_OPTIONS;
  readonly motoristaOptions = REPORT_MOTORISTA_OPTIONS;
  readonly placaOptions = REPORT_PLACA_OPTIONS;

  readonly datePreset = signal<ReportDatePreset>('previous-month');
  readonly customDateFrom = signal('');
  readonly customDateTo = signal('');

  readonly tomadoresCte = signal<string[]>([]);
  readonly tomadoresCargas = signal<string[]>([]);
  readonly motoristasMdfe = signal<string[]>([]);
  readonly placasMdfe = signal<string[]>([]);

  /** Painel multi-select (Tomador / Motorista / Placa) aberto; `null` = todos fechados. */
  readonly reportMultiselectOpen = signal<ReportMultiselectId | null>(null);

  protected onTabClick(tab: ReportTab): void {
    this.reportMultiselectOpen.set(null);
    this.activeReportTabChange.emit(tab);
  }

  protected onToggleColumn(column: string): void {
    this.toggleReportColumn.emit(column);
  }

  protected onSelectAllColumns(): void {
    this.selectAllReportColumns.emit();
  }

  protected setDatePresetFromSelect(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.datePreset.set(el.value as ReportDatePreset);
  }

  protected setCustomFrom(event: Event): void {
    this.customDateFrom.set((event.target as HTMLInputElement).value);
  }

  protected setCustomTo(event: Event): void {
    this.customDateTo.set((event.target as HTMLInputElement).value);
  }

  protected toggleTomador(tab: 'CTe' | 'Cargas', name: string): void {
    const update = (list: string[]) =>
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name];
    if (tab === 'CTe') {
      this.tomadoresCte.update(update);
    } else {
      this.tomadoresCargas.update(update);
    }
  }

  protected toggleReportMultiselect(id: ReportMultiselectId): void {
    this.reportMultiselectOpen.update((cur) => (cur === id ? null : id));
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentCloseMultiselect(ev: MouseEvent): void {
    const el = ev.target as HTMLElement | null;
    if (!el?.closest) {
      return;
    }
    const open = this.reportMultiselectOpen();
    if (!open) {
      return;
    }
    if (el.closest(`[data-report-ms="${open}"]`)) {
      return;
    }
    this.reportMultiselectOpen.set(null);
  }

  protected multiselectSummary(selected: readonly string[], emptyLabel: string): string {
    if (selected.length === 0) {
      return emptyLabel;
    }
    if (selected.length === 1) {
      return selected[0]!;
    }
    if (selected.length === 2) {
      return `${selected[0]!}, ${selected[1]!}`;
    }
    return `${selected.length} selecionados`;
  }

  protected toggleMotoristaMdfe(name: string): void {
    this.motoristasMdfe.update((list) =>
      list.includes(name) ? list.filter((n) => n !== name) : [...list, name]
    );
  }

  protected togglePlacaMdfe(plate: string): void {
    this.placasMdfe.update((list) =>
      list.includes(plate) ? list.filter((p) => p !== plate) : [...list, plate]
    );
  }

  /** Demo: aqui entraria preview PDF / tela cheia. */
  protected onViewReport(): void {
    // Intencionalmente vazio até existir endpoint de preview.
  }

  /** Demo: aqui entraria download xlsx da API. */
  protected onDownloadExcel(): void {
    // Intencionalmente vazio até existir export.
  }
}
