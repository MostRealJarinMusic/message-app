import { Component, effect, inject } from '@angular/core';
import { ServerService } from 'src/app/services/server/server.service';

@Component({
  selector: 'app-server-title-bar',
  imports: [],
  templateUrl: './server-title-bar.component.html',
  styleUrl: './server-title-bar.component.scss',
})
export class ServerTitleBarComponent {
  private serverService = inject(ServerService);
  protected serverName: string | undefined;

  constructor() {
    effect(() => {
      // this.serverName = this.serverService.getServerById(
      //   this.serverService.currentServer()!
      // )?.name;
      const serverId = this.serverService.currentServer();
      if (serverId !== null && serverId !== undefined) {
        this.serverName = this.serverService.getServerById(serverId)?.name;
      } else {
        this.serverName = undefined;
      }
    });
  }
}
