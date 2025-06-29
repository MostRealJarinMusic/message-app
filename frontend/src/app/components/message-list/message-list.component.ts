import {
  Component,
  effect,
  inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Message } from '@common/types';
import { MessageService } from 'src/app/services/message/message.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-message-list',
  imports: [],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  private messageService = inject(MessageService);
  private messages = this.messageService.messages;

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

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
    }
  }

  protected formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
