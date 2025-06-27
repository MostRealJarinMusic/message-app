import { Component, effect, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { ServerListComponent } from '../server-list/server-list.component';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { ServerService } from 'src/app/services/server/server.service';
import { MessageService } from 'src/app/services/message/message.service';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [ChatRoomComponent, ChannelListComponent, ServerListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  serverService = inject(ServerService);
  channelService = inject(ChannelService);
  messageService = inject(MessageService);

  private serverIdSignal = toSignal(this.serverService.currentServerId$);
  private channelIdSignal = toSignal(this.channelService.currentChannelId$);

  constructor() {
    //Load the server
    this.serverService.loadServers();

    effect(() => {
      const serverId = this.serverIdSignal();
      if (serverId) this.channelService.loadChannels(serverId);
    });

    effect(() => {
      const channelId = this.channelIdSignal();
      if (channelId) this.messageService.loadMessageHistory(channelId);
    });
  }
}
