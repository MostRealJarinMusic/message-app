import { Component, inject, input } from '@angular/core';
import { EmbedData, EmbedType } from '@common/types';
import { InviteService } from 'src/app/features/invite/services/invite/invite.service';

@Component({
  selector: 'app-embed-host',
  imports: [],
  templateUrl: './embed-host.component.html',
  styleUrl: './embed-host.component.scss',
})
export class EmbedHostComponent {
  protected inviteService = inject(InviteService);

  embed = input<EmbedData>();
  protected EmbedType = EmbedType;
}
