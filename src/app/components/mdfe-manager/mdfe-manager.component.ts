import { Component, computed, effect, input, output, signal } from '@angular/core';
import { MdfeRow } from '../../dashboard.models';
import { filterMdfeRows } from './mdfe-list-search.utils';
import type { NewMdfeDocumentSourceId } from './mdfe-manager.models';
import { NewMdfeDocumentModalComponent } from './new-mdfe-document-modal.component';

@Component({
  selector: 'app-mdfe-manager',
  standalone: true,
  imports: [NewMdfeDocumentModalComponent],
  templateUrl: './mdfe-manager.component.html',
})
export class MdfeManagerComponent {
  readonly rows = input<MdfeRow[]>([]);

  /** Contador do shell: cada incremento abre o modal “Novo MDFe” (mesmo fluxo do botão na lista). */
  readonly openNewMdfeModalRequest = input(0);

  /** Parent can log or open a global toast; optional. */
  readonly newMdfeDocumentSourceSelected = output<NewMdfeDocumentSourceId>();

  readonly searchTerm = signal('');
  readonly isNewMdfeDocumentModalOpen = signal(false);

  /** Short confirmation after picking CT-e / NF-e (wire to API later). */
  readonly newMdfeFlowBanner = signal<string | null>(null);

  readonly filteredRows = computed(() => filterMdfeRows(this.rows(), this.searchTerm()));

  constructor() {
    effect(() => {
      const tick = this.openNewMdfeModalRequest();
      if (tick > 0) {
        queueMicrotask(() => this.openNewMdfeDocumentModal());
      }
    });
  }

  private readonly sourceLabels: Record<NewMdfeDocumentSourceId, string> = {
    cte: 'CT-e (frete para terceiros)',
    nfe: 'NF-e (carga própria)',
  };

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  openNewMdfeDocumentModal(): void {
    this.isNewMdfeDocumentModalOpen.set(true);
  }

  closeNewMdfeDocumentModal(): void {
    this.isNewMdfeDocumentModalOpen.set(false);
  }

  onNewMdfeDocumentSourcePicked(source: NewMdfeDocumentSourceId): void {
    this.newMdfeDocumentSourceSelected.emit(source);
    this.newMdfeFlowBanner.set(`Origem escolhida: ${this.sourceLabels[source]} — próximo: assistente / API.`);
    this.closeNewMdfeDocumentModal();
  }

  dismissNewMdfeFlowBanner(): void {
    this.newMdfeFlowBanner.set(null);
  }

  /** Filtros avançados do MDFe: ainda não há modal; mantemos o botão alinhado ao CTe. */
  onFilterClick(): void {
    // Ex.: abrir o mesmo padrão de modal de filtros quando existir `MdfeListFiltersModalComponent`.
  }

  onMdfeFlowHelp(): void {
    // Ex.: abrir central de ajuda ou rota `/ajuda/mdfe`.
  }
}
