import { Component, computed, output, signal } from '@angular/core';
import {
  MOCK_SEFAZ_NFE_ROWS,
  NFE_INGEST_METHOD_OPTIONS,
  type NewCteNfeWizardPanel,
  type NfeIngestMethodId,
} from './cte-manager.models';
import { normalizeText } from './cte-list-filter.utils';

/**
 * After the user picks “NF-e” on the new CTe flow: choose how to load the NF-e (XML, key, SEFAZ list, …).
 */
@Component({
  selector: 'app-new-cte-nfe-wizard',
  standalone: true,
  templateUrl: './new-cte-nfe-wizard.component.html',
})
export class NewCteNfeWizardComponent {
  /** User confirmed rows from the demo SEFAZ table. */
  readonly nfeSefazRowsPicked = output<{ rowIds: string[] }>();

  /** Short line for the amber strip on the parent (success / demo refresh). */
  readonly userBanner = output<string>();

  /** “Voltar” from the first NF-e step — reopen the document picker modal. */
  readonly reopenDocumentPicker = output<void>();

  /** Wizard fully closed (backdrop, X, or after confirm). */
  readonly wizardClosed = output<void>();

  readonly activePanel = signal<NewCteNfeWizardPanel>('method');

  readonly sefazListSearch = signal('');
  readonly sefazFilterUiOpen = signal(false);
  readonly sefazSelectedIds = signal<ReadonlySet<string>>(new Set());
  readonly sefazStepInlineError = signal<string | null>(null);
  readonly sefazListStatusMessage = signal<string | null>(null);

  readonly nfeMethodCards = NFE_INGEST_METHOD_OPTIONS;

  readonly sefazFilteredRows = computed(() => {
    const q = normalizeText(this.sefazListSearch().trim());
    if (!q) {
      return MOCK_SEFAZ_NFE_ROWS;
    }
    return MOCK_SEFAZ_NFE_ROWS.filter((row) => {
      const blob = normalizeText(
        [row.emission, row.nfNumber, row.issuer, row.recipient, row.value, row.situation].join(' ')
      );
      return blob.includes(q);
    });
  });

  readonly sefazAllVisibleSelected = computed(() => {
    const visible = this.sefazFilteredRows();
    const selected = this.sefazSelectedIds();
    if (visible.length === 0) {
      return false;
    }
    return visible.every((r) => selected.has(r.id));
  });

  onBackdropClick(): void {
    this.closeWizard();
  }

  closeWizard(): void {
    this.resetSefazListUi();
    this.activePanel.set('method');
    this.wizardClosed.emit();
  }

  backToDocumentPicker(): void {
    this.resetSefazListUi();
    this.activePanel.set('method');
    this.reopenDocumentPicker.emit();
  }

  backToMethodPicker(): void {
    this.activePanel.set('method');
  }

  selectNfeMethod(methodId: NfeIngestMethodId): void {
    switch (methodId) {
      case 'xml-upload':
        this.activePanel.set('xml-placeholder');
        break;
      case 'access-key':
        this.activePanel.set('access-key-placeholder');
        break;
      case 'sefaz-sync':
        this.activePanel.set('sefaz');
        break;
    }
  }

  updateSefazListSearch(value: string): void {
    this.sefazStepInlineError.set(null);
    this.sefazListStatusMessage.set(null);
    this.sefazListSearch.set(value);
  }

  toggleSefazFilterPanel(): void {
    this.sefazFilterUiOpen.update((v) => !v);
  }

  clearSefazListFilters(): void {
    this.sefazListSearch.set('');
    this.sefazFilterUiOpen.set(false);
    this.sefazListStatusMessage.set(null);
    this.sefazStepInlineError.set(null);
  }

  refreshSefazListDemo(): void {
    this.sefazStepInlineError.set(null);
    this.sefazListStatusMessage.set('Lista atualizada (dados de demonstração). Na produção, isto viria do seu backend.');
  }

  toggleSefazRowSelection(rowId: string): void {
    this.sefazStepInlineError.set(null);
    const next = new Set(this.sefazSelectedIds());
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    this.sefazSelectedIds.set(next);
  }

  toggleSelectAllVisibleSefazRows(): void {
    this.sefazStepInlineError.set(null);
    const visibleIds = this.sefazFilteredRows().map((r) => r.id);
    const selected = this.sefazSelectedIds();
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }
    this.sefazSelectedIds.set(next);
  }

  confirmSefazSelection(): void {
    const ids = [...this.sefazSelectedIds()];
    if (ids.length === 0) {
      this.sefazStepInlineError.set('Selecione pelo menos uma NF-e na tabela.');
      return;
    }
    this.sefazStepInlineError.set(null);
    this.nfeSefazRowsPicked.emit({ rowIds: ids });
    this.userBanner.emit(`${ids.length} NF-e(s) adicionadas ao fluxo (demo — ligue ao endpoint real quando existir).`);
    this.closeWizard();
  }

  requestHelp(): void {}

  private resetSefazListUi(): void {
    this.sefazListSearch.set('');
    this.sefazFilterUiOpen.set(false);
    this.sefazSelectedIds.set(new Set());
    this.sefazStepInlineError.set(null);
    this.sefazListStatusMessage.set(null);
  }
}
