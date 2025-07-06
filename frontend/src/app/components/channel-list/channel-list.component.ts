import { Component, computed, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { ListboxModule } from 'primeng/listbox';
import { NgClass } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { AccordionPanelComponent } from '../custom/accordion-panel/accordion-panel.component';

@Component({
  selector: 'app-channel-list',
  imports: [
    ButtonModule,
    FormsModule,
    ListboxModule,
    NgClass,
    AccordionModule,
    AccordionPanelComponent,
  ],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
})
export class ChannelListComponent {
  private channelService = inject(ChannelService);

  protected categories = this.channelService.categories;
  protected channels = this.channelService.channels;
  protected currentChannel = this.channelService.currentChannel;

  protected groupedChannels = computed(() => {
    const map = new Map<string | null, Channel[]>();

    for (const channel of this.channels()) {
      const key = channel.categoryId ?? null;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(channel);
    }

    console.log(map);

    return map;
  });

  selectChannel(id: string) {
    this.channelService.selectChannel(id);
  }

  onChannelChange(event: any) {
    const selected: Channel = event.value;
    this.selectChannel(selected.id);
  }

  protected startCreateChannel(categoryId: string) {
    console.log('Starting to create a new channel in category');
  }
}
