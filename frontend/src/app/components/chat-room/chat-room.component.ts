import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from '../../services/message/message.service';
import { Message } from '@common/types';
import { MessageInputComponent } from '../message-input/message-input.component';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    CardModule,
    FormsModule,
    MessageInputComponent,
  ],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.scss',
})
export class ChatRoomComponent {
  private messageService = inject(MessageService);

  protected messages = this.messageService.messages;
  // protected newMessage = '';

  // sendMessage() {
  //   //Message sanitisation here
  //   if (!this.newMessage.trim()) return;

  //   //Use message service to send message
  //   this.messageService.sendMessage(this.newMessage);

  //   //Clear message
  //   this.newMessage = '';
  // }

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
