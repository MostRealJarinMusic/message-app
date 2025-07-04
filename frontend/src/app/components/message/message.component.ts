import { Component, inject, Input, signal } from '@angular/core';
import { Message } from '@common/types';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { isToday, isYesterday } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-message',
  imports: [
    AvatarGroupModule,
    AvatarModule,
    ButtonModule,
    TooltipModule,
    CommonModule,
    FormsModule,
    TextareaModule,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  private messageService = inject(MessageService);

  @Input() message!: Message;
  @Input() isMine!: boolean;

  protected currentlyEdited = this.messageService.currentlyEdited;
  protected newContent = signal('');

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

  protected startMessageEdit() {
    if (this.currentlyEdited() !== this.message.id) {
      //Set it
      this.currentlyEdited.set(this.message.id);

      //Opens the form
      this.newContent.set(this.message.content);
    }
  }

  protected escapeMessageEdit() {
    this.currentlyEdited.set(null);
    this.newContent.set('');
  }

  protected enterMessageEdit() {
    //Detect any edits
    //If no edits - escape message edit
    const editedContent = this.newContent().trim();
    if (editedContent === this.message.content) {
      console.log('No edits made');
      this.escapeMessageEdit();
      return;
    }

    //Edits
    this.messageService.editMessage(this.message.id, editedContent);
    console.log('Edits made');

    this.escapeMessageEdit();
  }

  protected onInputChange(message: string) {
    this.newContent.set(message);
  }

  protected handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enterMessageEdit();
    }

    //Escape message edits
    if (event.key === 'Escape') {
      event.preventDefault();
      this.escapeMessageEdit();
    }
  }

  protected deleteMessage() {
    this.messageService.deleteMessage(this.message.id);
  }
}
