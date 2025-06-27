import { Component, OnDestroy, OnInit } from '@angular/core';
import { Server } from '@common/types';
import { Subscription } from 'rxjs';
import { ServerService } from 'src/app/services/server/server.service';

@Component({
  selector: 'app-server-list',
  imports: [],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent implements OnInit, OnDestroy {
  servers: Server[] = [];
  currentServerId: string | null = null;
  private subscriptions = new Subscription();

  constructor(private serverService: ServerService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.serverService.servers$.subscribe((servers) => {
        this.servers = servers;
      })
    );

    this.subscriptions.add(
      this.serverService.currentServerId$.subscribe((id) => {
        this.currentServerId = id;
      })
    );

    this.serverService.loadServers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectServer(id: string) {
    this.serverService.selectServer(id);
  }
}
