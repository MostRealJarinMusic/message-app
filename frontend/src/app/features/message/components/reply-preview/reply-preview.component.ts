import { Component, inject, input, OnInit } from '@angular/core';

import { UserService } from 'src/app/features/user/services/user/user.service';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-reply-preview',
  imports: [],
  templateUrl: './reply-preview.component.html',
  styleUrl: './reply-preview.component.scss',
})
export class ReplyPreviewComponent implements OnInit {
  public replyToId = input<string | null>();
  public deletedReply = false;
  public replyTarget?: { authorName: string; content: string };

  private messageService = inject(MessageService);
  private userService = inject(UserService);

  ngOnInit(): void {
    const replyToId = this.replyToId();
    if (!replyToId) return;

    const replyTarget = this.messageService.getMessage(replyToId);
    if (!replyTarget) {
      //Not loaded
      this.replyTarget = { authorName: '', content: 'Failed to load message' };
      return;
    }

    if (replyTarget.deleted) {
      this.deletedReply = true;
      this.replyTarget = { authorName: '', content: 'Original message was deleted' };
      return;
    }

    this.replyTarget = {
      authorName: this.userService.getUsername(replyTarget.authorId),
      content: replyTarget.content!,
    };
  }
}
