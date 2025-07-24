import { CommonModule, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Server } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { ServerService } from 'src/app/services/server/server.service';

@Component({
  selector: 'app-server-list',
  imports: [NgClass, ButtonModule, CommonModule],
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

  createServer() {
    //Temporary
    this.serverService.createServer('TEST SERVER');
  }
}
