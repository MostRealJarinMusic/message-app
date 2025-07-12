import { Component, computed, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { ListboxModule } from 'primeng/listbox';
import { NgClass } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { AccordionPanelComponent } from '../custom/accordion-panel/accordion-panel.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChannelCreateDialogComponent } from '../dialogs/channel-create-dialog/channel-create-dialog.component';
import { ChannelCategoryService } from 'src/app/services/channel-category/channel-category.service';

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
  providers: [DialogService],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
})
export class ChannelListComponent implements OnDestroy {
  private dialogService = inject(DialogService);
  private channelService = inject(ChannelService);
  private categoryService = inject(ChannelCategoryService);

  protected createDialogRef!: DynamicDialogRef;

  protected categories = this.categoryService.channelCategories;
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
    console.log(categoryId);
    this.showCreateDialog(categoryId);
  }

  showCreateDialog(categoryId: string) {
    this.createDialogRef = this.dialogService.open(
      ChannelCreateDialogComponent,
      {
        header: 'Create Channel',
        width: '30%',
        baseZIndex: 10000,
        modal: true,
        dismissableMask: true,
        closeOnEscape: true,
        closable: true,
        styleClass: '!bg-surface-700 !pt-0',
        data: {
          categoryName: this.categoryService.getCategoryName(categoryId),
        },
      }
    );

    this.createDialogRef.onClose.subscribe((result) => {
      if (result) {
        console.log('Dialog closed with:', result);
      } else {
        console.log('Dialog closed - no channel created.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.createDialogRef) this.createDialogRef.close();
  }
}
