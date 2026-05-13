import { Component, computed, input, output } from '@angular/core';

/**
 * Modal stacking tiers (numeric `z-[…]` — must sit above the shell sidebar `z-30`).
 * Order: … CTe new-doc (120) < MDFe new-doc (125) < origin form (130) < NF-e wizard (140).
 */
export type CteModalOverlayTier =
  | 'cte-list-filters'
  | 'cte-list-filters-nested'
  | 'cte-new-doc-picker'
  | 'mdfe-new-doc-picker'
  | 'cte-origin-doc-form'
  | 'cte-nfe-wizard';

const TIER_Z_CLASS: Record<CteModalOverlayTier, string> = {
  'cte-list-filters': 'z-[100]',
  'cte-list-filters-nested': 'z-[110]',
  'cte-new-doc-picker': 'z-[120]',
  'mdfe-new-doc-picker': 'z-[125]',
  'cte-origin-doc-form': 'z-[130]',
  'cte-nfe-wizard': 'z-[140]',
};

/**
 * Shared backdrop + panel + header (title + optional toolbar on one row; close fixed at top-end).
 * Toolbar projects beside the title (`items-start`); close does not share that row so it stays in the corner.
 * Use `cteModalShellHeading` / `cteModalShellToolbar` on projected nodes.
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
  /** Backdrop tint behind the dialog panel. */
  readonly backdropToneClass = input('bg-slate-950/40');
  readonly scrollableBackdrop = input(true);
  readonly panelMaxWidthClass = input('max-w-4xl');
  readonly panelPaddingClass = input('p-5 sm:p-6');
  readonly ariaLabelledBy = input.required<string>();
  readonly closeButtonAriaLabel = input('Fechar');

  readonly backdropDismiss = output<void>();
  readonly closeRequested = output<void>();

  readonly tierZClass = computed(() => TIER_Z_CLASS[this.overlayTier()]);

  readonly backdropClasses = computed(() => {
    const parts = [
      'fixed inset-0 flex min-h-screen flex-col items-center',
      this.tierZClass(),
      this.backdropToneClass(),
      'px-4 py-8 sm:px-6',
    ];
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
