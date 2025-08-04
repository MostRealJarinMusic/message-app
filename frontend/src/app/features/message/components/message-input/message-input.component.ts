import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageDraftService } from 'src/app/features/message/services/message-draft/message-draft.service';
import { MessageService } from 'src/app/features/message/services/message/message.service';
import { TextareaModule } from 'primeng/textarea';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';

@Component({
  selector: 'app-message-input',
  imports: [
    InputTextModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TextareaModule,
  ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);
  private draftService = inject(MessageDraftService);

  protected newMessage = signal('');
  protected currentChannel = computed(() =>
    this.channelService.currentChannel()
  );
  protected placeholderMessage = computed(
    () => `Message ${this.channelService.currentChannelName()}`
  );

  private sync = effect(() => {
    const channel = this.currentChannel();
    if (!channel) return;

    const draftSignal = this.draftService.getDraftSignal(channel);
    this.newMessage.set(draftSignal());
  });

  protected onInputChange(message: string) {
    this.newMessage.set(message);
    this.draftService.setDraft(this.currentChannel()!, message);
  }

  protected sendMessage() {
    //Message sanitisation here
    const message = this.newMessage().trim();
    if (!message) return;

    this.messageService.sendMessage(message);
    this.draftService.clearDraft(this.currentChannel()!);
    this.newMessage.set('');
  }

  protected handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
