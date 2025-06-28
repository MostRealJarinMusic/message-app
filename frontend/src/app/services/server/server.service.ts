import { inject, Injectable, signal } from '@angular/core';
import { Server } from '@common/types';
import { BehaviorSubject } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private apiService = inject(PrivateApiService);

  readonly servers = signal<Server[]>([]);
  readonly currentServer = signal<string | null>(null);

  selectServer(id: string) {
    this.currentServer.set(id);
  }

  loadServers() {
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
}
