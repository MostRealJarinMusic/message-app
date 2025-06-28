import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { ServerListComponent } from '../server-list/server-list.component';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { ServerService } from 'src/app/services/server/server.service';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
  selector: 'app-dashboard',
  imports: [ChatRoomComponent, ChannelListComponent, ServerListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private serverService = inject(ServerService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);

  private currentServer = this.serverService.currentServer;
  private currentChannel = this.channelService.currentChannel;

  constructor() {
    //Load the server
    this.serverService.loadServers();

    effect(() => {
      const currentServer = this.currentServer();
      if (currentServer) this.channelService.loadChannels(currentServer);
    });

    effect(() => {
      const currentChannel = this.currentChannel();
      if (currentChannel)
        this.messageService.loadMessageHistory(currentChannel);
    });
  }
}
