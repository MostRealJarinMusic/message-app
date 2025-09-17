import { Component, effect, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { Message } from '@common/types';
import { MessageService } from 'src/app/features/message/services/message/message.service';
import { MessageComponent } from '../message/message.component';
import { UserService } from 'src/app/features/user/services/user/user.service';

interface DecoratedMessage {
  message: Message;
  showHeader: boolean;
}

@Component({
  selector: 'app-message-list',
  imports: [],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  private messageService = inject(MessageService);
  private userService = inject(UserService);

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  @ViewChild('messageList')
  messageListRef!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.renderMessages(this.messageService.messages());
    });
  }

  private renderMessages(messages: Message[]) {
    const currentUser = this.userService.currentUser();
    if (!currentUser) return;

    const decorated = this.getDecoratedMessages(messages);

    this.container.clear();

    for (const message of decorated) {
      const componentReference = this.container.createComponent(MessageComponent);
      componentReference.instance.message = message.message;
      componentReference.instance.isMine = message.message.authorId === currentUser.id;
      componentReference.instance.showHeader = message.showHeader;
    }

    setTimeout(() => this.scrollToBottom(), 100);
  }

  private getDecoratedMessages(messages: Message[]): DecoratedMessage[] {
    let prev: Message | null = null;
    return messages.map((message) => {
      let showHeader = true;
      if (prev) {
        const sameAuthor = prev.authorId === message.authorId;
        const timeDifference =
          new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime();
        const withinBounds = timeDifference < 5 * 60 * 1000;
        if (sameAuthor && withinBounds && !message.replyToId) showHeader = false;
      }

      prev = message;
      return { message, showHeader };
    });
  }

  private scrollToBottom() {
    const element = this.messageListRef.nativeElement;
    if (!element) return;

    const target = element.scrollHeight;
    element.scrollTop = target;
  }
}
