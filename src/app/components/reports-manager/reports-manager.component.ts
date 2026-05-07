import { Component, input, output } from '@angular/core';
import { ReportTab } from '../../dashboard.models';

@Component({
  selector: 'app-reports-manager',
  standalone: true,
  templateUrl: './reports-manager.component.html',
})
export class ReportsManagerComponent {
  readonly reportTabs = input<ReportTab[]>([]);
  readonly activeReportTab = input<ReportTab>('CTe');
  readonly reportColumns = input<string[]>([]);
  readonly selectedReportColumns = input<string[]>([]);

  readonly activeReportTabChange = output<ReportTab>();
  readonly toggleReportColumn = output<string>();
  readonly selectAllReportColumns = output<void>();

  protected onTabClick(tab: ReportTab): void {
    this.activeReportTabChange.emit(tab);
  }

  protected onToggleColumn(column: string): void {
    this.toggleReportColumn.emit(column);
  }

  protected onSelectAllColumns(): void {
    this.selectAllReportColumns.emit();
  }
}
