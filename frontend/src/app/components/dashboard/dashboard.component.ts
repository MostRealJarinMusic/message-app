import { Component } from '@angular/core';
import { ChatRoomComponent } from '../chat-room/chat-room.component';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { ServerListComponent } from '../server-list/server-list.component';

@Component({
  selector: 'app-dashboard',
  imports: [ChatRoomComponent, ChannelListComponent, ServerListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
