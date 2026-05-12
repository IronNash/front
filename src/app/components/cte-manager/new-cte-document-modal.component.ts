import { Component, input, output } from '@angular/core';
import type { NewCteDocumentId } from './cte-manager.models';
import { NEW_CTE_DOCUMENT_CARDS } from './cte-manager.models';

/**
 * Step 1 of “Novo CTe”: pick which real-world document you are starting from (NF-e, third-party CTe, etc.).
 */
import { CteModalShellComponent } from '../ui/cte-modal-shell.component';

@Component({
  selector: 'app-new-cte-document-modal',
  standalone: true,
  imports: [CteModalShellComponent],
  templateUrl: './new-cte-document-modal.component.html',
})
export class NewCteDocumentModalComponent {
  readonly open = input(false);

  readonly documentPicked = output<NewCteDocumentId>();
  readonly modalClosed = output<void>();
  readonly helpRequested = output<void>();

  readonly documentCards = NEW_CTE_DOCUMENT_CARDS;

  onBackdropClick(): void {
    this.modalClosed.emit();
  }

  close(): void {
    this.modalClosed.emit();
  }

  pickDocument(id: NewCteDocumentId): void {
    this.documentPicked.emit(id);
  }

  requestHelp(): void {
    this.helpRequested.emit();
  }
}
