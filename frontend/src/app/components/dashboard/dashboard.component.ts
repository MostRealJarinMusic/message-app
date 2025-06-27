import { Component, inject, OnInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  serverService = inject(ServerService);
  channelService = inject(ChannelService);
  messageService = inject(MessageService);

  ngOnInit(): void {
    //Load the server
    this.serverService.loadServers();

    //Load the channels
    this.serverService.currentServerId$
      .pipe(
        filter((id) => !!id),
        distinctUntilChanged()
      )
      .subscribe((serverId) => {
        this.channelService.loadChannels(serverId!);
      });

    //Load the message history
    this.channelService.currentChannelId$
      .pipe(
        filter((id) => !!id),
        distinctUntilChanged()
      )
      .subscribe((channelId) => {
        this.messageService.loadMessageHistory(channelId!);
      });
  }
}
