import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Server } from '@common/types';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { ServerService } from 'src/app/services/server/server.service';

@Component({
  selector: 'app-server-list',
  imports: [NgClass, ButtonModule, CommonModule, ContextMenu],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent implements OnInit {
  private serverService = inject(ServerService);

  @ViewChild('serverContextMenu') serverContextMenu!: ContextMenu;
  protected contextMenuItems: MenuItem[] = [];
  protected contextMenuServer = signal<Server | null>(null);

  protected servers = this.serverService.servers;
  protected currentServer = this.serverService.currentServer;

  selectServer(id: string) {
    this.serverService.selectServer(id);
  }

  createServer() {
    //Temporary
    this.serverService.createServer('TEST SERVER');
  }

  ngOnInit(): void {
    this.contextMenuItems = [
      {
        label: 'Edit Server',
        icon: 'pi pi-pencil',
        command: () => {},
      },
      {
        separator: true,
      },
      {
        label: 'Delete Server',
        icon: 'pi pi-trash',
        command: () => {
          //this.channelService.deleteChannel(this.contextMenuChannel!.id);
          this.serverService.deleteServer(this.contextMenuServer()!.id);
        },
      },
    ];
  }

  showContextMenu(event: MouseEvent, server: Server) {
    this.contextMenuServer.set(server);
    this.serverContextMenu.show(event);
  }
}
