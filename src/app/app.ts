/**
 * Root shell: layout chrome, tab selection, período global (Tela inicial + CTe), totalizadores.
 * Feature areas mantêm sinais locais onde faz sentido; período de lista CTe espelha `shellPeriod`.
 */
import { Component, computed, signal } from '@angular/core';
import { CteManagerComponent } from './components/cte-manager/cte-manager.component';
import { type NewCteDocumentId, type NewCteOriginDocumentFormPayload } from './components/cte-manager/cte-manager.models';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { LayoutShellComponent } from './components/layout-shell/layout-shell.component';
import { MdfeManagerComponent } from './components/mdfe-manager/mdfe-manager.component';
import { ReportsManagerComponent } from './components/reports-manager/reports-manager.component';
import {
  DEMO_CTE_ROWS,
  DEMO_MENU_ITEMS,
  DEMO_MDFE_ROWS,
  DEMO_REPORT_TABS,
} from './dashboard.demo-data';
import { CteRow, MdfeRow, MenuTab, ReportTab } from './dashboard.models';
import { computeDashboardTotals, type ShellCtePeriodSlice } from './dashboard-metrics.utils';
import { reportColumnsByTab, selectedReportColumnsByTabDefault } from './reports.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LayoutShellComponent,
    HomeDashboardComponent,
    CteManagerComponent,
    MdfeManagerComponent,
    ReportsManagerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly sidebarOpen = signal(false);
  protected readonly activeTab = signal<MenuTab>('Tela inicial');
  protected readonly activeReportTab = signal<ReportTab>('CTe');

  protected readonly shellPeriod = signal<ShellCtePeriodSlice>({
    preset: 'este-mes',
    customStart: '',
    customEnd: '',
  });

  protected readonly showXmlAccountingBanner = signal(true);

  /** Zerado ao entrar na aba CTe pelo menu; incrementado só pela Tela inicial (“Novo CTe”) para abrir o seletor. */
  protected readonly newCtePickerRequest = signal(0);

  /** Idem para a aba MDFe. */
  protected readonly newMdfePickerRequest = signal(0);

  /** Document the user picked in “Novo CTe” (banner on the CTe tab). */
  protected readonly newCteDocumentChoice = signal<NewCteDocumentId | null>(null);

  /** Demo only: row ids returned from the in-app SEFAZ list when the user clicks Adicionar. */
  protected readonly lastNfeSefazDemoRowIds = signal<string | null>(null);

  private readonly newCteDocumentLabels: Record<NewCteDocumentId, string> = {
    nfe: 'NF-e',
    'third-party-cte': 'CTe de outra transportadora',
    'rural-producer': 'Nota de produtor rural',
    other: 'Outro documento',
  };

  protected readonly menuItems: MenuTab[] = [...DEMO_MENU_ITEMS];
  protected readonly reportTabs: ReportTab[] = [...DEMO_REPORT_TABS];

  protected readonly cteRows: CteRow[] = DEMO_CTE_ROWS;
  protected readonly mdfeRows: MdfeRow[] = DEMO_MDFE_ROWS;

  protected readonly reportColumnsByTab = reportColumnsByTab;

  protected readonly selectedReportColumnsByTab = signal<Record<ReportTab, string[]>>(
    selectedReportColumnsByTabDefault
  );

  protected readonly dashboardTotals = computed(() =>
    computeDashboardTotals(this.cteRows, this.mdfeRows, this.shellPeriod())
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

  protected onShellPeriodChange(slice: ShellCtePeriodSlice): void {
    this.shellPeriod.set(slice);
  }

  protected dismissXmlBanner(): void {
    this.showXmlAccountingBanner.set(false);
  }

  protected onLayoutHelpClick(): void {
    // Ex.: `/ajuda` ou modal de suporte.
  }

  protected setActiveTab(tab: MenuTab): void {
    if (tab === 'CTe') {
      this.newCtePickerRequest.set(0);
    }
    if (tab === 'MDFe') {
      this.newMdfePickerRequest.set(0);
    }
    this.activeTab.set(tab);
    this.closeSidebar();
    if (tab !== 'CTe') {
      this.newCteDocumentChoice.set(null);
      this.lastNfeSefazDemoRowIds.set(null);
    }
  }

  protected goCteFromHome(): void {
    this.setActiveTab('CTe');
    this.newCtePickerRequest.update((n) => n + 1);
  }

  protected goMdfeFromHome(): void {
    this.setActiveTab('MDFe');
    this.newMdfePickerRequest.update((n) => n + 1);
  }

  protected onNewCteDocumentSelected(documentId: NewCteDocumentId): void {
    this.newCteDocumentChoice.set(documentId);
  }

  protected onNfeSefazSelectionConfirmed(event: { rowIds: string[] }): void {
    this.lastNfeSefazDemoRowIds.set(event.rowIds.join(', '));
  }

  /** Hook when the user submits the manual origin-document form (non–NF-e paths). */
  protected onNewCteOriginDocumentCaptured(_event: {
    pathChoice: NewCteDocumentId;
    payload: NewCteOriginDocumentFormPayload;
  }): void {
    // Ex.: POST /api/cte/drafts com `_event.payload` e seguir o assistente.
  }

  protected clearNewCteDocumentChoice(): void {
    this.newCteDocumentChoice.set(null);
    this.lastNfeSefazDemoRowIds.set(null);
  }

  protected clearLastNfeSefazDemoPick(): void {
    this.lastNfeSefazDemoRowIds.set(null);
  }

  protected labelForNewCteDocument(id: NewCteDocumentId): string {
    return this.newCteDocumentLabels[id];
  }

  protected setActiveReportTab(tab: ReportTab): void {
    this.activeReportTab.set(tab);
    const allowed = new Set(this.reportColumnsByTab[tab]);
    this.selectedReportColumnsByTab.update((map) => ({
      ...map,
      [tab]: map[tab].filter((col) => allowed.has(col)),
    }));
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
