import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket/socket.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message/message.service';

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
  messages: any[] = [];
  messagesSub!: Subscription;
  newMessage = '';

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    // this.wsService.connect();

    // // this.wsService.onMessage.subscribe((msg) => {
    // //   this.messages.push(msg);
    // //   //Save to pouch
    // // });
    // this.messagesSub = this.wsService.messages$.subscribe(
    //   message => {
    //     this.messages.push(message);
    //     console.log(this.messages)
    //   }
    // )

    this.messagesSub = this.messageService.onMessage().subscribe(message => {
      this.messages.push(message);
      console.log(message)
      //Save to local PouchDB for storage
    })
  }

  ngOnDestroy(): void {
    this.messagesSub.unsubscribe();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    //this.wsService.send(this.newMessage);

    //Use message service to send message
    this.messageService.sendMessage(this.newMessage);

    //Clear message
    this.newMessage = '';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    console.log(date)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
}
