import { Component, input } from '@angular/core';
import { EmbedData, EmbedType } from '@common/types';

@Component({
  selector: 'app-embed-host',
  imports: [],
  templateUrl: './embed-host.component.html',
  styleUrl: './embed-host.component.scss',
})
export class EmbedHostComponent {
  embed = input<EmbedData>();
  protected EmbedType = EmbedType;
}
