import { Injectable } from '@angular/core';
import { Server } from '@common/types';
import { BehaviorSubject } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private currentServerIdSubject = new BehaviorSubject<string | null>(null);
  public currentServerId$ = this.currentServerIdSubject.asObservable();

  private serversSubject = new BehaviorSubject<Server[]>([]);
  public servers$ = this.serversSubject.asObservable();

  constructor(private apiService: PrivateApiService) {}

  selectServer(id: string) {
    this.currentServerIdSubject.next(id);
  }

  loadServers() {
    this.apiService.getServers().subscribe({
      next: (servers) => {
        this.serversSubject.next(servers);

        if (!this.currentServerIdSubject.value && servers.length > 0) {
          this.selectServer(servers[0].id);
        }

        console.log(servers);
      },
      error: (err) => console.error('Failed to load channels', err),
    });
  }
}
