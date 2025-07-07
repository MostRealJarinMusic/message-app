import { Component, input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-channel-create-dialog',
  imports: [DialogModule, ButtonModule, InputTextModule],
  templateUrl: './channel-create-dialog.component.html',
  styleUrl: './channel-create-dialog.component.scss',
})
export class ChannelCreateDialogComponent {
  visible = input(false);
}
