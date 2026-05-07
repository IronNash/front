import { Component, input } from '@angular/core';
import { CteRow } from '../../dashboard.models';

@Component({
  selector: 'app-cte-manager',
  standalone: true,
  templateUrl: './cte-manager.component.html',
})
export class CteManagerComponent {
  readonly rows = input<CteRow[]>([]);
}
