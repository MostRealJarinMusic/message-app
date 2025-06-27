import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from '../../services/message/message.service';
import { Message } from '@common/types';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [InputTextModule, ButtonModule, CardModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.scss',
})
export class ChatRoomComponent {
  private messageService = inject(MessageService);

  messages: Signal<Message[]> = toSignal(this.messageService.messages$, {
    initialValue: [],
  });
  newMessage = '';

  sendMessage() {
    //Message sanitisation here
    if (!this.newMessage.trim()) return;

    //Use message service to send message
    this.messageService.sendMessage(this.newMessage);

    //Clear message
    this.newMessage = '';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // getUsername(senderId: string): string {
  //   const username = this.userService.getUsernameById(senderId);
  //   if (!username) {
  //     this.userService.fetchUser(senderId);
  //     return 'Loading...';
  //   }
  //   return username;
  // }
}
