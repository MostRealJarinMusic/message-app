import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Server } from '@common/types';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { DialogService } from 'primeng/dynamicdialog';
import { ServerService } from 'src/app/services/server/server.service';

@Component({
  selector: 'app-server-list',
  imports: [NgClass, ButtonModule, CommonModule, ContextMenu],
  providers: [DialogService],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent implements OnInit {
  private serverService = inject(ServerService);

  //Context menu
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
        label: 'Server Settings',
        command: () => {},
      },
      {
        label: 'Delete Server',
        command: () => {
          this.serverService.deleteServer(this.contextMenuServer()!.id);
          //this.contextMenuServer.set(null);
        },
      },
      {
        separator: true,
      },
      {
        label: 'Create Category',
        command: () => {},
      },
      {
        label: 'Create Channel',
        command: () => {},
      },
    ];
  }

  showContextMenu(event: MouseEvent, server: Server) {
    this.contextMenuServer.set(server);
    this.serverContextMenu.show(event);
  }
}
