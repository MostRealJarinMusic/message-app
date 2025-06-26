import { Injectable } from '@angular/core';
import { Channel } from '@common/types';
import { BehaviorSubject } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private curreentChannelIdSubject = new BehaviorSubject<string | null>(null);
  public currentChannelId$ = this.curreentChannelIdSubject.asObservable();

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  constructor(private apiService: PrivateApiService) { }

  selectChannel(id: string) {
    this.curreentChannelIdSubject.next(id);
  }

  loadChannels() {
    this.apiService.getChannels().subscribe({
      next: (channels) => {
        this.channelsSubject.next(channels);

        if (!this.curreentChannelIdSubject.value && channels.length > 0) {
          this.selectChannel(channels[0].id);
        }

        console.log(channels)
      },
      error: (err) => console.error('Failed to load channels', err)
    })
  }

  get currentChannel() {
    return this.curreentChannelIdSubject.value;
  }
}
