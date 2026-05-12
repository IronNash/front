import { Component, computed, input, output } from '@angular/core';

/**
 * Named overlay tiers — must match `z-cte-*` tokens in `src/styles.css` (`@theme`).
 */
export type CteModalOverlayTier =
  | 'cte-list-filters'
  | 'cte-list-filters-nested'
  | 'cte-new-doc-picker'
  | 'cte-origin-doc-form'
  | 'cte-nfe-wizard';

const TIER_BACKDROP_CLASS: Record<CteModalOverlayTier, string> = {
  'cte-list-filters': 'z-cte-list-filters',
  'cte-list-filters-nested': 'z-cte-list-filters-nested',
  'cte-new-doc-picker': 'z-cte-new-doc-picker',
  'cte-origin-doc-form': 'z-cte-origin-doc-form',
  'cte-nfe-wizard': 'z-cte-nfe-wizard',
};

/**
 * Shared backdrop + white panel + header row (title slot, optional toolbar, close).
 * Use attribute `cteModalShellHeading` / `cteModalShellToolbar` on projected nodes.
 */
@Component({
  selector: 'app-cte-modal-shell',
  standalone: true,
  imports: [],
  templateUrl: './cte-modal-shell.component.html',
})
export class CteModalShellComponent {
  readonly open = input(false);
  readonly overlayTier = input<CteModalOverlayTier>('cte-new-doc-picker');
  /** e.g. `bg-slate-950/40` — wizard uses slightly stronger tint. */
  readonly backdropToneClass = input('bg-slate-950/40');
  readonly scrollableBackdrop = input(true);
  readonly panelMaxWidthClass = input('max-w-4xl');
  readonly panelPaddingClass = input('p-5 shadow-2xl sm:p-6');
  readonly ariaLabelledBy = input.required<string>();
  readonly closeButtonAriaLabel = input('Fechar');

  readonly backdropDismiss = output<void>();
  readonly closeRequested = output<void>();

  readonly tierBackdropClass = computed(() => TIER_BACKDROP_CLASS[this.overlayTier()]);

  readonly backdropClasses = computed(() => {
    const parts = ['fixed inset-0', this.tierBackdropClass(), this.backdropToneClass(), 'px-4 py-8 sm:px-6'];
    if (this.scrollableBackdrop()) {
      parts.push('overflow-y-auto');
    }
    return parts.join(' ');
  });

  onBackdrop(): void {
    this.backdropDismiss.emit();
  }

  onCloseClick(): void {
    this.closeRequested.emit();
  }
}
