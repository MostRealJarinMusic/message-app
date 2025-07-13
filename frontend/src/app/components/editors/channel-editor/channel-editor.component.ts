import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChannelService } from 'src/app/services/channel/channel.service';

@Component({
  selector: 'app-channel-editor',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './channel-editor.component.html',
  styleUrl: './channel-editor.component.scss',
})
export class ChannelEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private channelService = inject(ChannelService);

  protected channelId: string = '';
  channelName: string = '';

  ngOnInit(): void {
    this.channelId = this.route.snapshot.paramMap.get('id') || '';
    const channel = this.channelService.getChannelById(this.channelId);

    if (!channel) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.channelName = channel.name;
  }

  saveChanges() {
    //this.channelService.updateChannel(this.channelId
    this.closeEditor();
  }

  closeEditor() {
    this.router.navigate(['/dashboard']);
  }
}
