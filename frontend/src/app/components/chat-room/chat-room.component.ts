import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket/socket.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subscription } from 'rxjs';

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
export class ChatRoomComponent implements OnInit {
  messages: any[] = [];
  messagesSub!: Subscription;
  newMessage = '';

  constructor(private wsService: SocketService) {}

  ngOnInit() {
    this.wsService.connect();

    // this.wsService.onMessage.subscribe((msg) => {
    //   this.messages.push(msg);
    //   //Save to pouch
    // });
    this.messagesSub = this.wsService.messages$.subscribe(
      message => {
        this.messages.push(message);
        console.log(this.messages)
      }
    )
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.wsService.send(this.newMessage);
    this.newMessage = '';
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
