import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message/message.service';
import { Message } from '@common/types';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [
    NgFor,
    InputTextModule,
    ButtonModule,
    CardModule,
    FormsModule
  ],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.scss'
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  messagesSub!: Subscription;
  newMessage = '';

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messageService.loadMessageHistory();
    this.messagesSub = this.messageService.messages$.subscribe(messages => {
      this.messages = messages;
    })
  }

  ngOnDestroy(): void {
    this.messagesSub.unsubscribe();
  }

  sendMessage() {
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
      hour12: true 
    });
  }
}
