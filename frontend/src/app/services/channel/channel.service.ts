import { Injectable } from '@angular/core';
import { Channel, Server } from '@common/types';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';
import { ServerService } from '../server/server.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private currentChannelIdSubject = new BehaviorSubject<string | null>(null);
  public currentChannelId$ = this.currentChannelIdSubject.asObservable();

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  constructor(
    private apiService: PrivateApiService,
    private serverService: ServerService
  ) {
    this.serverService.currentServerId$
      .pipe(
        filter((id): id is string => !!id),
        distinctUntilChanged()
      )
      .subscribe((serverId) => {
        this.loadChannels(serverId);
      });
  }

  selectChannel(id: string) {
    this.currentChannelIdSubject.next(id);
  }

  loadChannels(serverId: string) {
    this.apiService.getChannels(serverId).subscribe({
      next: (channels) => {
        this.channelsSubject.next(channels);

        if (!this.currentChannelIdSubject.value && channels.length > 0) {
          this.selectChannel(channels[0].id);
        }

        //console.log(channels);
      },
      error: (err) => console.error('Failed to load channels', err),
    });
  }

  get currentChannel() {
    return this.currentChannelIdSubject.value;
  }
}
