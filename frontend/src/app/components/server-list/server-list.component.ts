import { CommonModule, NgClass } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Server } from '@common/types';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChannelCategoryService } from 'src/app/services/channel-category/channel-category.service';
import { ServerService } from 'src/app/services/server/server.service';
import { ChannelCreateDialogComponent } from '../dialogs/channel-create-dialog/channel-create-dialog.component';
import { ChannelService } from 'src/app/services/channel/channel.service';

@Component({
  selector: 'app-server-list',
  imports: [NgClass, ButtonModule, CommonModule, ContextMenu],
  providers: [DialogService],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent implements OnInit, OnDestroy {
  private serverService = inject(ServerService);
  private channelService = inject(ChannelService);
  private categoryService = inject(ChannelCategoryService);
  private dialogService = inject(DialogService);

  //Context menu
  @ViewChild('serverContextMenu') serverContextMenu!: ContextMenu;
  protected contextMenuItems: MenuItem[] = [];

  //Channel creation
  private createChannelDialogRef!: DynamicDialogRef;

  protected servers = this.serverService.servers;
  protected currentServer = this.serverService.currentServer;
  protected contextMenuServer = signal<Server | null>(null);

  selectServer(id: string) {
    this.serverService.selectServer(id);
  }

  createServer() {
    //Temporary
    this.serverService.createServer('TEST SERVER');
  }

  ngOnInit(): void {
    this.initContextMenu();
  }

  ngOnDestroy(): void {
    if (this.createChannelDialogRef) this.createChannelDialogRef.close();
  }

  private initContextMenu() {
    this.contextMenuItems = [
      {
        label: 'Server Settings',
        command: () => {},
      },
      {
        label: 'Delete Server',
        command: () => {
          this.serverService.deleteServer(this.contextMenuServer()!.id);
          this.contextMenuServer.set(null);
        },
      },
      {
        separator: true,
      },
      {
        label: 'Create Category',
        command: () => {
          this.categoryService.createCategory(
            this.contextMenuServer()!.id,
            'TEST CATEGORY'
          );
        },
      },
      {
        label: 'Create Channel',
        command: () => {
          this.startChannelCreate();
        },
      },
    ];
  }

  showContextMenu(event: MouseEvent, server: Server) {
    this.contextMenuServer.set(server);
    this.serverContextMenu.show(event);
  }

  protected startChannelCreate() {
    this.createChannelDialogRef = this.dialogService.open(
      ChannelCreateDialogComponent,
      {
        header: 'Create Channel',
        width: '30%',
        baseZIndex: 10000,
        modal: true,
        dismissableMask: true,
        closeOnEscape: true,
        closable: true,
        styleClass: '!bg-surface-700 !pt-0',
        data: {
          categoryName: null,
        },
      }
    );

    this.createChannelDialogRef.onClose.subscribe((newChannelName) => {
      if (newChannelName) {
        console.log('Dialog closed with:', newChannelName);
        this.channelService.createChannel(newChannelName, null);
      } else {
        console.log('Dialog closed - no channel created.');
      }
    });
  }
}
