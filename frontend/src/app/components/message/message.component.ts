import { Component, inject, Input } from '@angular/core';
import { Message } from '@common/types';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { isToday, isYesterday } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-message',
  imports: [
    AvatarGroupModule,
    AvatarModule,
    ButtonModule,
    TooltipModule,
    CommonModule,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  private messageService = inject(MessageService);

  @Input() message!: Message;

  // protected getUsername(id: string): string {
  //   return this.userService.getUsername(id);
  // }

  //protected username$ = this.userService.getUsername(this.message.authorId);

  protected formatTime(timestamp: string): string {
    const dateTime = new Date(timestamp);
    const timeStr = dateTime.toLocaleTimeString('en-UK', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });

    if (isToday(dateTime)) return timeStr;
    if (isYesterday(dateTime)) return `Yesterday at ${timeStr}`;

    const dateStr = dateTime.toLocaleDateString('en-UK');
    return `${dateStr}, ${timeStr}`;
  }

  protected editMessage() {}

  protected deleteMessage() {
    this.messageService.deleteMessage(this.message.id);
  }
}
