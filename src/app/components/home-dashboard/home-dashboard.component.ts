import { Component, input, output } from '@angular/core';
import type { DashboardTotals, ShellCtePeriodSlice } from '../../dashboard-metrics.utils';
import { HOME_PERIOD_SELECT_OPTIONS } from '../../dashboard-metrics.utils';
import type { CtePeriodPreset } from '../cte-manager/cte-manager.models';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  templateUrl: './home-dashboard.component.html',
})
export class HomeDashboardComponent {
  readonly metrics = input.required<DashboardTotals>();
  readonly periodSlice = input.required<ShellCtePeriodSlice>();
  readonly showXmlBanner = input(true);

  readonly periodOptions = HOME_PERIOD_SELECT_OPTIONS;
  /** Padrão decorativo para o placeholder do QR (não é um QR escaneável). */
  protected readonly qrCells = Array.from({ length: 64 }, (_, i) => i);

  qrCellDark(idx: number): boolean {
    return (idx + Math.floor(idx / 8)) % 3 !== 0;
  }

  readonly periodSliceChange = output<ShellCtePeriodSlice>();
  readonly goCteTab = output<void>();
  readonly goMdfeTab = output<void>();
  readonly dismissXmlBanner = output<void>();

  protected onPresetChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    const preset = el.value as CtePeriodPreset;
    const current = this.periodSlice();
    this.periodSliceChange.emit({
      ...current,
      preset,
    });
  }

  protected onCustomFromChange(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.periodSliceChange.emit({ ...this.periodSlice(), customStart: v });
  }

  protected onCustomToChange(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.periodSliceChange.emit({ ...this.periodSlice(), customEnd: v });
  }
}
