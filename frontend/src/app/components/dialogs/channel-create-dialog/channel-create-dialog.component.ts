import { Component, inject, input, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-create-dialog',
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './channel-create-dialog.component.html',
  styleUrl: './channel-create-dialog.component.scss',
})
export class ChannelCreateDialogComponent {
  protected ref = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);
  private channelService = inject(ChannelService);

  visible = input(false);
  categoryId: string;
  categoryName: string;
  channelName = '';

  constructor() {
    this.categoryId = this.config.data.categoryId;
    this.categoryName = this.channelService.getCategoryName(this.categoryId)!;
  }

  close() {
    this.ref.close();
  }
}
