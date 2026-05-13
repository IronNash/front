import { Component, input, output } from '@angular/core';
import { CteModalShellComponent } from '../ui/cte-modal-shell.component';
import type { NewMdfeDocumentSourceId } from './mdfe-manager.models';
import { NEW_MDFE_DOCUMENT_CARDS } from './mdfe-manager.models';

/**
 * Step 1 of “Novo MDFe”: choose whether the manifest is anchored on CT-e(s) or NF-e(s).
 * Next steps (wizard / API) plug in after `documentSourcePicked`.
 */
@Component({
  selector: 'app-new-mdfe-document-modal',
  standalone: true,
  imports: [CteModalShellComponent],
  templateUrl: './new-mdfe-document-modal.component.html',
})
export class NewMdfeDocumentModalComponent {
  readonly open = input(false);

  readonly documentSourcePicked = output<NewMdfeDocumentSourceId>();
  readonly modalClosed = output<void>();
  readonly helpRequested = output<void>();

  readonly documentCards = NEW_MDFE_DOCUMENT_CARDS;

  onBackdropClick(): void {
    this.modalClosed.emit();
  }

  close(): void {
    this.modalClosed.emit();
  }

  goBack(): void {
    this.close();
  }

  pickSource(id: NewMdfeDocumentSourceId): void {
    this.documentSourcePicked.emit(id);
  }

  requestHelp(): void {
    this.helpRequested.emit();
  }
}
