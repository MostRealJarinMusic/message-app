import { Component } from '@angular/core';
import { ChatRoomComponent } from '../chat-room/chat-room.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    ChatRoomComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
