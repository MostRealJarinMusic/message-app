import { Component, inject, input, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
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

  visible = input(false);
  categoryName: string;
  channelName = '';

  constructor() {
    this.categoryName = this.config.data.categoryName;
  }

  protected close() {
    this.ref.close();
  }

  protected createChannel() {
    this.ref.close(this.channelName);
  }
}
