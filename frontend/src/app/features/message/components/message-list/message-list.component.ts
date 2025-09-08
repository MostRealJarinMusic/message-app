import { Component, effect, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { Message } from '@common/types';
import { MessageService } from 'src/app/features/message/services/message/message.service';
import { MessageComponent } from '../message/message.component';
import { SessionService } from 'src/app/core/services/session/session.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

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
    this.container.clear();
    for (const message of messages) {
      const componentReference = this.container.createComponent(MessageComponent);
      componentReference.instance.message = message;
      componentReference.instance.isMine = message.authorId === this.userService.currentUser()?.id;
    }

    setTimeout(() => this.scrollToBottom(), 5);
  }

  private scrollToBottom() {
    const element = this.messageListRef.nativeElement;
    if (element) {
      const target = element.scrollHeight;

      element.scrollTop = target; //element.scrollHeight;

      console.log(element.scrollHeight);
      console.log(element.scrollTop);
    }
  }
}
