import { Component, Input } from '@angular/core';
import { Message } from '@common/types';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { isToday, isYesterday } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-message',
  imports: [AvatarGroupModule, AvatarModule, ButtonModule, TooltipModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  @Input() message!: Message;

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

  protected deleteMessage() {}
}
