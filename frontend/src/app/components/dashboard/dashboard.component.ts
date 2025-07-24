import { Component, effect, inject } from '@angular/core';
import { ChannelListComponent } from '../channel-list/channel-list.component';
import { ServerListComponent } from '../server-list/server-list.component';
import { ServerService } from 'src/app/services/server/server.service';
import { DividerModule } from 'primeng/divider';
import { MessageListComponent } from '../message-list/message-list.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { UserListComponent } from '../user-list/user-list.component';
import { ChannelTitleBarComponent } from '../channel-title-bar/channel-title-bar.component';
import { ServerTitleBarComponent } from '../server-title-bar/server-title-bar.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-dashboard',
  imports: [
    ChannelListComponent,
    ServerListComponent,
    DividerModule,
    MessageListComponent,
    MessageInputComponent,
    UserListComponent,
    ChannelTitleBarComponent,
    ServerTitleBarComponent,
    DynamicDialogModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private serverService = inject(ServerService);

  constructor() {
    //Load the server
    this.serverService.loadServers();
  }
}
