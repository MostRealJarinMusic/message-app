import { inject, Injectable, signal } from '@angular/core';
import {
  LoggerType,
  NavigationView,
  Server,
  ServerCreate,
  ServerUpdate,
  WSEventType,
} from '@common/types';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);
  private navService = inject(NavigationService);
  private logger = inject(LoggerService);

  readonly servers = signal<Server[]>([]);
  readonly currentServer = signal<string | null>(null);

  constructor() {
    this.initWebSocket();
  }

  viewDMs() {
    this.currentServer.set(null);
    this.navService.navigate('direct-messages');
  }

  selectServer(id: string | null) {
    this.currentServer.set(id);
    this.navService.navigate('servers');
  }

  loadServers() {
    this.logger.log(LoggerType.SERVICE_SERVER, 'Loading servers');

    this.apiService.getServers().subscribe({
      next: (servers) => {
        this.servers.set(servers);

        if (!this.currentServer() && servers.length > 0) {
          this.selectServer(servers[0].id);
        }

        this.navService.setChildren(
          'servers',
          this.servers().map((s) => {
            return { id: s.id };
          }),
        );
      },
      error: (err) => this.logger.error(LoggerType.SERVICE_SERVER, 'Failed to load servers', err),
    });
  }

  getServerById(id: string): Server | undefined {
    return this.servers().find((server) => server.id === id);
  }

  private initWebSocket(): void {
    //Listeners for server creation, edits and deletes

    //Currently for all servers -
    this.wsService.on(WSEventType.SERVER_CREATE).subscribe((server) => {
      this.servers.update((current) => [...current, server]);

      this.navService.addChildren('servers', [{ id: server.id }]);

      this.selectServer(server.id);
    });

    //Deletes
    this.wsService.on(WSEventType.SERVER_DELETE).subscribe((server) => {
      this.servers.update((current) => current.filter((s) => s.id !== server.id));

      this.navService.deleteChild('servers', server.id);

      if (server.id === this.currentServer()) {
        if (this.servers().length > 0) {
          this.selectServer(this.servers()[0].id);
        } else {
          this.selectServer(null);
        }
      }
    });

    this.wsService.on(WSEventType.SERVER_UPDATE).subscribe((server) => {
      this.servers.update((currentServers) =>
        currentServers!.map((s) => (s.id === server.id ? { ...s, ...server } : s)),
      );

      //Doesn't change the navigation tree
    });
  }

  public createServer(serverName: string) {
    const newServerData: ServerCreate = {
      name: serverName,
    };

    this.apiService.createServer(newServerData).subscribe({
      next: (server) => {
        this.logger.log(LoggerType.SERVICE_SERVER, 'Successful server creation');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_SERVER, 'Failed to create server:', err);
      },
    });
  }

  public deleteServer(serverId: string) {
    this.apiService.deleteServer(serverId).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_SERVER, 'Successful server deletion');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_SERVER, 'Unsuccessful server deletion', err);
      },
    });
  }

  public editServer(serverId: string, serverUpdate: ServerUpdate) {
    this.apiService.editServer(serverId, serverUpdate).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_SERVER, 'Successful edit');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_SERVER, 'Unsuccesful edit', err);
      },
    });
  }
}
