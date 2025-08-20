import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';

@Component({
  selector: 'app-dms-list',
  imports: [ButtonModule, DividerModule, CommonModule],
  providers: [DialogService],
  templateUrl: './dms-list.component.html',
  styleUrl: './dms-list.component.scss',
})
export class DMsListComponent {
  private channelService = inject(ChannelService);
  protected navService = inject(NavigationService);
}
