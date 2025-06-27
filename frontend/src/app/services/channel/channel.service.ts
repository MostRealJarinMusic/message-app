import { inject, Injectable } from '@angular/core';
import { Channel } from '@common/types';
import { BehaviorSubject } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiService = inject(PrivateApiService);

  private currentChannelIdSubject = new BehaviorSubject<string | null>(null);
  public currentChannelId$ = this.currentChannelIdSubject.asObservable();

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

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
      },
      error: (err) => console.error('Failed to load channels', err),
    });
  }

  get currentChannel() {
    return this.currentChannelIdSubject.value;
  }
}
