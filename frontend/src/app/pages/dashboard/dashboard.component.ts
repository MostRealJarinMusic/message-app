import { Component, inject } from '@angular/core';
import { ChannelListComponent } from '../../features/channel/components/channel-list/channel-list.component';
import { ServerService } from 'src/app/features/server/services/server/server.service';
import { DividerModule } from 'primeng/divider';
import { MessageListComponent } from '../../features/message/components/message-list/message-list.component';
import { MessageInputComponent } from '../../features/message/components/message-input/message-input.component';
import { ChannelTitleBarComponent } from '../../features/channel/components/channel-title-bar/channel-title-bar.component';
import { ServerTitleBarComponent } from '../../features/server/components/server-title-bar/server-title-bar.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ServerListComponent } from 'src/app/features/server/components/server-list/server-list.component';
import { UserListComponent } from 'src/app/features/user/components/user-list/user-list.component';
import { FriendService } from 'src/app/features/friend/services/friend/friend.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { FriendsTitleBarComponent } from 'src/app/features/friend/components/friends-title-bar/friends-title-bar.component';
import { DMsListComponent } from 'src/app/features/dms/components/dms-list/dms-list.component';
import { FriendsListComponent } from 'src/app/features/friend/components/friends-list/friends-list.component';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';

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
    FriendsTitleBarComponent,
    DMsListComponent,
    FriendsListComponent,
    DynamicDialogModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private serverService = inject(ServerService);
  private friendService = inject(FriendService);
  protected channelService = inject(ChannelService);
  protected navService = inject(NavigationService);

  constructor() {
    //Load servers
    // this.serverService.loadServers();

    //Load friends
    this.friendService.loadFriends();
  }
}
