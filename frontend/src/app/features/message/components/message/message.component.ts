import { Component, inject, input, Input, OnInit } from '@angular/core';
import { EmbedData, Message } from '@common/types';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'src/app/features/message/services/message/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { MessageEditService } from 'src/app/features/message/services/message-edit/message-edit.service';
import { UserService } from 'src/app/features/user/services/user/user.service';
import { EmbedResolverService } from 'src/app/core/services/embed-resolver/embed-resolver.service';
import { EmbedHostComponent } from 'src/app/shared/components/embed-host/embed-host.component';
import { MessageDraftService } from '../../services/message-draft/message-draft.service';
import { ReplyPreviewComponent } from '../reply-preview/reply-preview.component';
import { MessageHeaderComponent } from '../message-header/message-header.component';

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
    EmbedHostComponent,
    ReplyPreviewComponent,
    MessageHeaderComponent,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent implements OnInit {
  private messageService = inject(MessageService);
  private draftService = inject(MessageDraftService);
  protected userService = inject(UserService);
  private editService = inject(MessageEditService);
  private embedService = inject(EmbedResolverService);

  @Input({ required: true }) message!: Message;
  @Input({ required: true }) isMine!: boolean;
  @Input({ required: true }) showHeader: boolean = false;

  protected embedData: EmbedData | null = null;
  protected editContent = this.editService.getContent();

  async ngOnInit() {
    const url = this.message.content.match(/https?:\/\/[^\s]+/);
    if (url) {
      this.embedData = await this.embedService.resolve(url[0]);
    }

    console.log(this.showHeader);
  }

  protected startMessageEdit() {
    if (!this.editService.isEditing(this.message.id)) {
      this.editService.startEdit(this.message.id, this.message.content);
    }
  }

  protected escapeMessageEdit() {
    this.editService.closeEdit();
  }

  protected enterMessageEdit() {
    const editedContent = this.editContent().trim();
    if (editedContent === this.message.content) {
      console.log('No edits made');
      this.escapeMessageEdit();
      return;
    }

    //Empty edit content - register as attempt to delete
    this.editService.saveEdit((id, content) => {
      this.messageService.editMessage(id, content);
      console.log('Edits made');
    });
  }

  protected onInputChange(message: string) {
    this.editContent.set(message);
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

  protected isBeingEdited(): boolean {
    return this.editService.isEditing(this.message.id);
  }

  protected isReplyTarget(): boolean {
    const replyTarget = this.draftService.getReplyTargetSignal(this.message.channelId)();
    if (!replyTarget) return false;

    return replyTarget.id === this.message.id;
  }

  protected replyToMessage() {
    this.draftService.setReplyTarget(this.message.channelId, this.message);
  }
}
