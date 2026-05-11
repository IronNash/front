import { Component, input, output } from '@angular/core';
import { MenuTab } from '../../dashboard.models';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  templateUrl: './layout-shell.component.html',
})
export class LayoutShellComponent {
  readonly menuItems = input<MenuTab[]>([]);
  readonly activeTab = input<MenuTab>('Visão geral');
  readonly sidebarOpen = input(false);

  readonly menuToggle = output<void>();
  readonly menuClose = output<void>();
  readonly tabChange = output<MenuTab>();

  protected onMenuToggle(): void {
    this.menuToggle.emit();
  }

  protected onMenuClose(): void {
    this.menuClose.emit();
  }

  protected onTabChange(tab: MenuTab): void {
    this.tabChange.emit(tab);
  }
}
