import { Component, inject } from '@angular/core';
import { Server } from '@common/types';
import { ServerService } from 'src/app/services/server/server.service';

@Component({
  selector: 'app-server-list',
  imports: [],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent {
  private serverService = inject(ServerService);

  protected servers = this.serverService.servers;
  protected currentServer = this.serverService.currentServer;

  selectServer(id: string) {
    this.serverService.selectServer(id);
  }
}
