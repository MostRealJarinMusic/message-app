import { NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Channel } from '@common/types';
import { Subscription } from 'rxjs';
import { ChannelService } from 'src/app/services/channel/channel.service';

@Component({
  selector: 'app-channel-list',
  imports: [
    NgFor
  ],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss'
})
export class ChannelListComponent implements OnInit, OnDestroy {
  channels: Channel[] = []
  currentChannelId: string | null = null;
  private subscriptions = new Subscription();

  constructor(private channelService: ChannelService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.channelService.channels$.subscribe(channels => {
        this.channels = channels;
      })
    );

    this.subscriptions.add(
      this.channelService.currentChannelId$.subscribe(id => {
        this.currentChannelId = id;
      })
    );

    this.channelService.loadChannels();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectChannel(id: string) {
    this.channelService.selectChannel(id);
  }

}
