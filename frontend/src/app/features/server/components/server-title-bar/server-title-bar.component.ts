import { Component, effect, inject } from '@angular/core';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';

@Component({
  selector: 'app-server-title-bar',
  imports: [],
  templateUrl: './server-title-bar.component.html',
  styleUrl: './server-title-bar.component.scss',
})
export class ServerTitleBarComponent {
  private serverService = inject(ServerService);
  private navService = inject(NavigationService);
  protected serverName: string | undefined;

  constructor() {
    effect(() => {
      const serverId = this.navService.serverId();
      if (serverId !== null && serverId !== undefined) {
        this.serverName = this.serverService.getServerById(serverId)?.name;
      } else {
        this.serverName = undefined;
      }
    });
  }
}
