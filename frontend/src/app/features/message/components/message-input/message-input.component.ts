import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageDraftService } from 'src/app/features/message/services/message-draft/message-draft.service';
import { MessageService } from 'src/app/features/message/services/message/message.service';
import { TextareaModule } from 'primeng/textarea';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-message-input',
  imports: [InputTextModule, FormsModule, ButtonModule, CardModule, TextareaModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  private messageService = inject(MessageService);
  private navService = inject(NavigationService);
  private channelService = inject(ChannelService);
  private userService = inject(UserService);
  private draftService = inject(MessageDraftService);

  protected newMessage = signal('');
  protected currentChannel = computed(
    () => this.navService.activeChannelId() || this.navService.activeDMId(),
  );
  protected placeholderMessage = computed(() => {
    const channelId = this.navService.activeChannelId();
    const dmId = this.navService.activeDMId();

    if (!channelId && !dmId) return '';

    if (channelId) {
      const channel = this.channelService.getChannelById(channelId);
      if (!channel) return '';

      return `Message ${channel.name}`;
    } else if (dmId) {
      const dmChannel = this.channelService.getChannelById(dmId);
      if (!dmChannel) return '';

      if (!dmChannel.participants || dmChannel.participants.length !== 2) return '';
      if (dmChannel.participants[0] === this.userService.currentUser()!.id) {
        return `Message ${this.userService.getUsername(dmChannel.participants[1])}`;
      }
      return `Message ${this.userService.getUsername(dmChannel.participants[0])}`;
    }

    return '';
  });

  constructor() {
    effect(() => {
      const channel = this.currentChannel();
      if (!channel) return;

      const draftSignal = this.draftService.getDraftSignal(channel);
      this.newMessage.set(draftSignal());
    });
  }

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
