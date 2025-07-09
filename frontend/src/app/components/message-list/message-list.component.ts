import {
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Message } from '@common/types';
import { MessageService } from 'src/app/services/message/message.service';
import { MessageComponent } from '../message/message.component';
import { SessionService } from 'src/app/services/session/session.service';

@Component({
  selector: 'app-message-list',
  imports: [],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  private messageService = inject(MessageService);
  private sessionService = inject(SessionService);

  private messages = this.messageService.messages;

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  @ViewChild('messageList')
  messageListRef!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.renderMessages(this.messages());
    });
  }

  private renderMessages(messages: Message[]) {
    this.container.clear();
    for (const message of messages) {
      const componentReference =
        this.container.createComponent(MessageComponent);
      componentReference.instance.message = message;
      componentReference.instance.isMine =
        message.authorId === this.sessionService.currentUser()?.id;
    }

    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom() {
    const element = this.messageListRef.nativeElement;
    if (element) element.scrollTop = element.scrollHeight;
  }
}
