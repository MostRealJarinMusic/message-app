import { Component, input } from '@angular/core';
import { isToday, isYesterday } from 'date-fns';

@Component({
  selector: 'app-message-header',
  imports: [],
  templateUrl: './message-header.component.html',
  styleUrl: './message-header.component.scss',
})
export class MessageHeaderComponent {
  authorName = input<string>('');
  timestamp = input<string>();

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
}
