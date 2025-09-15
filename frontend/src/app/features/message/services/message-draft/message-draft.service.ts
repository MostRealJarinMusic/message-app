import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { Message } from '@common/types';

interface DraftState {
  content: string;
  replyTo?: Message;
}

@Injectable({
  providedIn: 'root',
})
export class MessageDraftService {
  //Map channel ID to drafts
  ///private drafts = signal(new Map<string, DraftState>());

  // getDraftSignal(channelId: string) {
  //   return computed(() => this.drafts().get(channelId) ?? '');
  // }

  // setDraft(channelId: string, message: string) {
  //   const newDrafts = new Map(this.drafts());
  //   newDrafts.set(channelId, message);
  //   this.drafts.set(newDrafts);
  // }

  // clearDraft(channelId: string) {
  //   const newDrafts = new Map(this.drafts());
  //   newDrafts.delete(channelId);
  //   this.drafts.set(newDrafts);
  // }

  // private drafts = new Map<string, WritableSignal<DraftState>>();

  // private getDraftSignal(channelId: string) {
  //   if (!this.drafts.has(channelId)) {
  //     this.drafts.set(channelId, signal<DraftState>({ content: '', replyTo: undefined }));
  //   }

  //   this.drafts.forEach((draft) => {
  //     console.log(draft());
  //   });

  //   return this.drafts.get(channelId)!;
  // }

  // getDraftContentSignal(channelId: string) {
  //   console.log('Getting content ');
  //   return computed(() => this.getDraftSignal(channelId)().content);
  // }

  // getReplyTargetSignal(channelId: string) {
  //   console.log('Getting reply target');
  //   return computed(() => this.getDraftSignal(channelId)().replyTo);
  // }

  // setDraftContent(channelId: string, content: string) {
  //   const draftSignal = this.getDraftSignal(channelId);
  //   const current = draftSignal();
  //   if (current.content !== content) {
  //     draftSignal.set({ ...current, content });
  //   }
  // }

  // setReplyTarget(channelId: string, message: Message) {
  //   const draftSignal = this.getDraftSignal(channelId);
  //   const current = draftSignal();
  //   if (current.replyTo !== message) {
  //     draftSignal.set({ ...current, replyTo: message });
  //   }
  // }

  // clearReplyTarget(channelId: string) {
  //   const draftSignal = this.drafts.get(channelId);
  //   if (!draftSignal) return;
  //   const current = draftSignal();
  //   if (current.replyTo !== undefined) {
  //     draftSignal.set({ ...current, replyTo: undefined });
  //   }
  // }

  // clearDraft(channelId: string) {
  //   this.drafts.delete(channelId);
  // }

  private drafts = signal(new Map<string, DraftState>());

  getDraftContentSignal(channelId: string) {
    return computed(() => this.drafts().get(channelId)?.content ?? '');
  }

  getReplyTargetSignal(channelId: string) {
    return computed(() => this.drafts().get(channelId)?.replyTo ?? undefined);
  }

  setDraftContent(channelId: string, content: string) {
    const current = this.drafts().get(channelId) ?? { content: '' };
    if (current.content === content) return;

    const newDrafts = new Map(this.drafts());
    newDrafts.set(channelId, { ...current, content });
    this.drafts.set(newDrafts);
  }

  setReplyTarget(channelId: string, message: Message) {
    const current = this.drafts().get(channelId) ?? { content: '' };
    if (current.replyTo === message) return;

    const newDrafts = new Map(this.drafts());
    newDrafts.set(channelId, { ...current, replyTo: message });
    this.drafts.set(newDrafts);
  }

  clearReplyTarget(channelId: string) {
    const current = this.drafts().get(channelId);
    if (!current || current.replyTo === undefined) return;

    const newDrafts = new Map(this.drafts());
    newDrafts.set(channelId, { ...current, replyTo: undefined });
    this.drafts.set(newDrafts);
  }

  clearDraft(channelId: string) {
    if (!this.drafts().has(channelId)) return;

    const newDrafts = new Map(this.drafts());
    newDrafts.delete(channelId);
    this.drafts.set(newDrafts);
  }
}
