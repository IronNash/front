import { Component, computed, input, output, signal } from '@angular/core';
import { CteRow } from '../../dashboard.models';
import { CteListFiltersModalComponent } from './cte-list-filters-modal.component';
import { NewCteDocumentModalComponent } from './new-cte-document-modal.component';
import { NewCteNfeWizardComponent } from './new-cte-nfe-wizard.component';
import { NewCteOriginDocumentFormModalComponent } from './new-cte-origin-document-form-modal.component';
import {
  createEmptyFilters,
  type CteFilters,
  type NewCteDocumentId,
  type NewCteOriginDocumentFormPayload,
} from './cte-manager.models';
import { filterCteRows } from './cte-list-filter.utils';

export type { NewCteDocumentId, NewCteOriginDocumentFormPayload } from './cte-manager.models';

@Component({
  selector: 'app-cte-manager',
  standalone: true,
  imports: [
    CteListFiltersModalComponent,
    NewCteDocumentModalComponent,
    NewCteNfeWizardComponent,
    NewCteOriginDocumentFormModalComponent,
  ],
  templateUrl: './cte-manager.component.html',
})
export class CteManagerComponent {
  readonly rows = input<CteRow[]>([]);

  /** Which document type the user chose in “Novo CTe” (NF-e, third-party CTe, …). */
  readonly newCteDocumentSelected = output<NewCteDocumentId>();

  /** Demo: user confirmed NF-e rows from the in-app SEFAZ list. */
  readonly nfeSefazSelectionConfirmed = output<{ rowIds: string[] }>();

  /** Non–NF-e path: user filled “Informe os dados do documento” (wire to API). */
  readonly newCteOriginDocumentCaptured = output<{
    pathChoice: NewCteDocumentId;
    payload: NewCteOriginDocumentFormPayload;
  }>();

  readonly searchTerm = signal('');
  readonly isNewCteDocumentPickerOpen = signal(false);
  readonly isNewCteNfeWizardOpen = signal(false);
  readonly newCteNfeWizardBanner = signal<string | null>(null);

  readonly isOriginDocumentFormModalOpen = signal(false);
  readonly originDocumentFormPathContext = signal<NewCteDocumentId | null>(null);
  readonly originDocumentFlowBanner = signal<string | null>(null);

  readonly isCteListFiltersModalOpen = signal(false);
  readonly appliedCteListFilters = signal<CteFilters>(createEmptyFilters());

  readonly hasActiveCteListFilters = computed(() => {
    const f = this.appliedCteListFilters();
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
    filterCteRows(this.rows(), this.searchTerm(), this.appliedCteListFilters())
  );

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  openNewCteDocumentPicker(): void {
    this.isNewCteDocumentPickerOpen.set(true);
  }

  closeNewCteDocumentPicker(): void {
    this.isNewCteDocumentPickerOpen.set(false);
  }

  onNewCteDocumentPicked(documentId: NewCteDocumentId): void {
    this.newCteDocumentSelected.emit(documentId);
    this.closeNewCteDocumentPicker();
    if (documentId === 'nfe') {
      this.isNewCteNfeWizardOpen.set(true);
    } else {
      this.originDocumentFormPathContext.set(documentId);
      this.isOriginDocumentFormModalOpen.set(true);
    }
  }

  onNewCteNfeWizardClosed(): void {
    this.isNewCteNfeWizardOpen.set(false);
  }

  onNewCteNfeWizardReopenDocumentPicker(): void {
    this.isNewCteNfeWizardOpen.set(false);
    this.openNewCteDocumentPicker();
  }

  onNfeSefazRowsPickedFromWizard(event: { rowIds: string[] }): void {
    this.nfeSefazSelectionConfirmed.emit(event);
  }

  onNewCteNfeWizardBanner(msg: string): void {
    this.newCteNfeWizardBanner.set(msg);
  }

  dismissNewCteNfeWizardBanner(): void {
    this.newCteNfeWizardBanner.set(null);
  }

  openNewCteHelp(): void {}

  onOriginDocumentFormModalClosed(): void {
    this.isOriginDocumentFormModalOpen.set(false);
    this.originDocumentFormPathContext.set(null);
  }

  openOriginDocumentFormHelp(): void {}

  onOriginDocumentFormSubmitted(payload: NewCteOriginDocumentFormPayload): void {
    const path = this.originDocumentFormPathContext();
    if (!path) {
      return;
    }
    this.newCteOriginDocumentCaptured.emit({ pathChoice: path, payload });
    this.originDocumentFlowBanner.set(
      `Referência salva (protótipo): ${payload.description.trim()} · emissão ${payload.issueDateIso}`
    );
    this.isOriginDocumentFormModalOpen.set(false);
    this.originDocumentFormPathContext.set(null);
  }

  dismissOriginDocumentFlowBanner(): void {
    this.originDocumentFlowBanner.set(null);
  }

  openCteListFiltersModal(): void {
    this.isCteListFiltersModalOpen.set(true);
  }

  onCteListFiltersModalClosed(): void {
    this.isCteListFiltersModalOpen.set(false);
  }

  onCteListFiltersSaved(filters: CteFilters): void {
    this.appliedCteListFilters.set(filters);
    this.isCteListFiltersModalOpen.set(false);
  }

  clearCteListModalFilters(): void {
    this.appliedCteListFilters.set(createEmptyFilters());
  }
}
