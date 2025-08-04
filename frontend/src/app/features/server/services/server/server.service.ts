import { inject, Injectable, signal } from '@angular/core';
import { Server, ServerCreate, ServerUpdate, WSEventType } from '@common/types';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);

  readonly servers = signal<Server[]>([]);
  readonly currentServer = signal<string | null>(null);

  constructor() {
    this.initWebSocket();
  }

  selectServer(id: string | null) {
    this.currentServer.set(id);
  }

  loadServers() {
    console.log('Loading servers');

    this.apiService.getServers().subscribe({
      next: (servers) => {
        this.servers.set(servers);

        if (!this.currentServer() && servers.length > 0) {
          this.selectServer(servers[0].id);
        }
      },
      error: (err) => console.error('Failed to load channels', err),
    });
  }

  getServerById(id: string): Server | undefined {
    return this.servers().find((server) => server.id === id);
  }

  private initWebSocket(): void {
    //Listeners for server creation, edits and deletes

    //Currently for all servers -
    this.wsService.on<Server>(WSEventType.SERVER_CREATE).subscribe((server) => {
      this.servers.update((current) => [...current, server]);

      this.selectServer(server.id);
    });

    //Deletes
    this.wsService.on<Server>(WSEventType.SERVER_DELETE).subscribe((server) => {
      this.servers.update((current) =>
        current.filter((s) => s.id !== server.id)
      );

      if (server.id === this.currentServer()) {
        if (this.servers().length > 0) {
          this.selectServer(this.servers()[0].id);
        } else {
          this.selectServer(null);
        }
      }
    });

    this.wsService.on<Server>(WSEventType.SERVER_UPDATE).subscribe((server) => {
      this.servers.update((currentServers) =>
        currentServers!.map((s) =>
          s.id === server.id ? { ...s, ...server } : s
        )
      );
    });
  }

  public createServer(serverName: string) {
    const newServerData: ServerCreate = {
      name: serverName,
    };

    this.apiService.createServer(newServerData).subscribe({
      next: (server) => {
        console.log('Successful server creation');
      },
      error: (err) => {
        console.error('Failed to create server:', err);
      },
    });
  }

  public deleteServer(serverId: string) {
    this.apiService.deleteServer(serverId).subscribe({
      next: () => {
        console.log('Successful server deletion');
      },
      error: (err) => {
        console.error('Unsuccessful server deletion', err);
      },
    });
  }

  public editServer(serverId: string, serverUpdate: ServerUpdate) {
    this.apiService.editServer(serverId, serverUpdate).subscribe({
      next: () => {
        console.log('Successful edit');
      },
      error: (err) => {
        console.error('Unsuccesful edit', err);
      },
    });
  }
}
