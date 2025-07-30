import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-server-create-dialog',
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './server-create-dialog.component.html',
  styleUrl: './server-create-dialog.component.scss',
})
export class ServerCreateDialogComponent {
  protected ref = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);

  visible = input(false);
  serverName = '';

  protected close() {
    this.ref.close();
  }

  protected createServer() {
    this.ref.close(this.serverName);
  }
}
