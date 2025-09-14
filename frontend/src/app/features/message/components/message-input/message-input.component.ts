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
import { TypingService } from 'src/app/features/typing/services/typing/typing.service';
import { clear } from 'console';

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
  private typingService = inject(TypingService);

  protected newMessage = signal('');
  protected currentChannelId = computed(
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
  protected activeTypers = computed(() => {
    if (this.typingService.activeChannelTypers().length === 0) return '';

    return `
    ${this.typingService
      .activeChannelTypers()
      .map((id) => this.userService.getUsername(id))
      .filter((name) => !!name)
      .join(
        ', ',
      )}${this.typingService.activeChannelTypers().length === 1 ? ' is' : ' are'} typing...
    `.trim();
  });

  private TYPING_THROTTLE = 3000;
  private TYPING_STOP = 5000;
  private typingTimeout!: NodeJS.Timeout;
  private lastTypingSent = 0;

  constructor() {
    effect(() => {
      const channelId = this.currentChannelId();
      if (!channelId) return;

      const draftSignal = this.draftService.getDraftSignal(channelId);
      this.newMessage.set(draftSignal());
    });

    effect(() => {
      console.log('Active typers:', this.typingService.activeChannelTypers());
    });
  }

  protected onInputChange(message: string) {
    this.newMessage.set(message);
    this.draftService.setDraft(this.currentChannelId()!, message);

    // Start typing
    const channelId = this.currentChannelId();
    if (!channelId) return;

    const now = Date.now();
    if (now - this.lastTypingSent < this.TYPING_THROTTLE) return;

    this.lastTypingSent = now;
    this.typingService.startTyping(channelId);

    //this.resetTypingTimeout(channelId);
  }

  protected onBlur() {
    const channelId = this.currentChannelId();
    if (!channelId) return;

    clearTimeout(this.typingTimeout);
    this.typingService.stopTyping(channelId);
  }

  protected onFocus() {
    const channelId = this.currentChannelId();
    if (!channelId) return;

    const now = Date.now();
    if (now - this.lastTypingSent < this.TYPING_THROTTLE) return;

    this.lastTypingSent = now;
    this.typingService.startTyping(channelId);

    //this.resetTypingTimeout(channelId);
  }

  private resetTypingTimeout(channelId: string) {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.typingService.stopTyping(channelId);
    }, this.TYPING_STOP);
  }

  protected sendMessage() {
    //Message sanitisation here
    const message = this.newMessage().trim();
    if (!message) return;

    this.messageService.sendMessage(message);
    this.draftService.clearDraft(this.currentChannelId()!);
    this.newMessage.set('');
  }

  protected handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
