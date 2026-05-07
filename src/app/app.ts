import { Component, computed, signal } from '@angular/core';
import { CteManagerComponent } from './components/cte-manager/cte-manager.component';
import { LayoutShellComponent } from './components/layout-shell/layout-shell.component';
import { MdfeManagerComponent } from './components/mdfe-manager/mdfe-manager.component';
import { ReportsManagerComponent } from './components/reports-manager/reports-manager.component';
import { CteRow, MdfeRow, MenuTab, ReportTab, StatCard } from './dashboard.models';
import { reportColumnsByTab, selectedReportColumnsByTabDefault } from './reports.config';

@Component({
  selector: 'app-root',
  imports: [LayoutShellComponent, CteManagerComponent, MdfeManagerComponent, ReportsManagerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly sidebarOpen = signal(false);
  protected readonly selectedMonth = signal('Ultimos 30 dias');
  protected readonly activeTab = signal<MenuTab>('Visao geral');
  protected readonly activeReportTab = signal<ReportTab>('CTe');

  protected readonly menuItems: MenuTab[] = ['Visao geral', 'CTe', 'MDFe', 'Relatorios'];
  protected readonly reportTabs: ReportTab[] = ['CTe', 'MDFe', 'Cargas'];

  protected readonly stats: StatCard[] = [
    {
      label: 'Documentos emitidos',
      value: '128',
      tone: 'blue',
    },
    {
      label: 'Pendencias',
      value: '07',
      tone: 'yellow',
    },
    {
      label: 'Viagens concluidas',
      value: '94%',
      tone: 'blue',
    },
    {
      label: 'Em andamento',
      value: '12',
      tone: 'yellow',
    },
    {
      label: 'Faturamento mensal',
      value: 'R$ 87.450,00',
      tone: 'green',
    },
  ];

  protected readonly periodLabel = computed(() => this.selectedMonth());

  protected readonly cteRows: CteRow[] = [
    {
      emission: '05/05/2026',
      number: '70',
      type: 'Normal',
      customer: 'TECNOTEMPERA T. TERMICA',
      route: 'Guaramirim/SC - Jundiai/SP',
      value: 'R$ 1.100,00',
      status: 'Manifestado',
    },
    {
      emission: '05/05/2026',
      number: '69',
      type: 'Normal',
      customer: 'DEVOTUM INDUSTRIA E COM.',
      route: 'Guaramirim/SC - Cachoeira/BA',
      value: 'R$ 4.150,00',
      status: 'Manifestado',
    },
    {
      emission: '05/05/2026',
      number: '68',
      type: 'Normal',
      customer: 'DEVOTUM INDUSTRIA E COM.',
      route: 'Guaramirim/SC - Cachoeira/BA',
      value: 'R$ 2.500,00',
      status: 'Manifestado',
    },
    {
      emission: '27/04/2026',
      number: '67',
      type: 'Normal',
      customer: 'S.M.A INDUSTRIA E COMER.',
      route: 'Guaramirim/SC - Cachoeira/BA',
      value: 'R$ 1.000,00',
      status: 'Manifestado',
    },
  ];

  protected readonly mdfeRows: MdfeRow[] = [
    {
      emission: '05/05/2026',
      number: '34',
      route: 'SC - SP',
      plate: 'TBM-6J14',
      cargoValue: 'R$ 200.000,00',
      cargoWeight: '440,00',
      documents: '1 CTe',
      status: 'Autorizado',
    },
    {
      emission: '05/05/2026',
      number: '33',
      route: 'SC - SP',
      plate: 'QJN-9E92',
      cargoValue: 'R$ 127.592,08',
      cargoWeight: '855,93',
      documents: '1 CTe',
      status: 'Autorizado',
    },
    {
      emission: '05/05/2026',
      number: '32',
      route: 'SC - SP',
      plate: 'GGB-2J23',
      cargoValue: 'R$ 152.476,60',
      cargoWeight: '1.132,86',
      documents: '1 CTe',
      status: 'Autorizado',
    },
    {
      emission: '27/04/2026',
      number: '31',
      route: 'SC - SP',
      plate: 'QJN-9E92',
      cargoValue: 'R$ 48.097,49',
      cargoWeight: '244,57',
      documents: '2 CTes',
      status: 'Encerrado',
    },
  ];

  protected readonly reportColumnsByTab = reportColumnsByTab;

  protected readonly selectedReportColumnsByTab = signal<Record<ReportTab, string[]>>(
    selectedReportColumnsByTabDefault
  );

  protected readonly currentReportColumns = computed(
    () => this.reportColumnsByTab[this.activeReportTab()]
  );

  protected readonly currentSelectedReportColumns = computed(
    () => this.selectedReportColumnsByTab()[this.activeReportTab()]
  );

  protected toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected setMonth(month: string): void {
    this.selectedMonth.set(month);
  }

  protected setActiveTab(tab: MenuTab): void {
    this.activeTab.set(tab);
    this.closeSidebar();
  }

  protected setActiveReportTab(tab: ReportTab): void {
    this.activeReportTab.set(tab);
  }

  protected toggleReportColumn(column: string): void {
    const tab = this.activeReportTab();
    const currentMap = this.selectedReportColumnsByTab();
    const currentColumns = currentMap[tab];
    const exists = currentColumns.includes(column);
    const updatedColumns = exists
      ? currentColumns.filter((item) => item !== column)
      : [...currentColumns, column];

    this.selectedReportColumnsByTab.set({
      ...currentMap,
      [tab]: updatedColumns,
    });
  }

  protected selectAllReportColumns(): void {
    const tab = this.activeReportTab();
    const currentMap = this.selectedReportColumnsByTab();
    this.selectedReportColumnsByTab.set({
      ...currentMap,
      [tab]: [...this.reportColumnsByTab[tab]],
    });
  }
}
