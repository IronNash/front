import { Component, input, output } from '@angular/core';
import { MenuTab } from '../../dashboard.models';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  templateUrl: './layout-shell.component.html',
})
export class LayoutShellComponent {
  readonly menuItems = input<MenuTab[]>([]);
  readonly activeTab = input<MenuTab>('Tela inicial');
  readonly sidebarOpen = input(false);

  /** Faixa opcional ao centro do header (ex.: documento disponível). */
  readonly headerBadgeText = input<string | null>(null);
  readonly headerUserPrimary = input('51.984.550 ROSANGELA FONTENELE DA SILVA PERES');
  readonly headerUserSecondary = input('Cadastros e configurações');

  readonly menuToggle = output<void>();
  readonly menuClose = output<void>();
  readonly tabChange = output<MenuTab>();
  readonly helpClick = output<void>();

  protected onMenuToggle(): void {
    this.menuToggle.emit();
  }

  protected onMenuClose(): void {
    this.menuClose.emit();
  }

  protected onTabChange(tab: MenuTab): void {
    this.tabChange.emit(tab);
  }

  protected onHelpClick(): void {
    this.helpClick.emit();
  }
}
