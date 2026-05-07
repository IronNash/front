import { Component, input } from '@angular/core';
import { MdfeRow } from '../../dashboard.models';

@Component({
  selector: 'app-mdfe-manager',
  standalone: true,
  templateUrl: './mdfe-manager.component.html',
})
export class MdfeManagerComponent {
  readonly rows = input<MdfeRow[]>([]);
}
