import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageDraftService {
  //Map channel ID to drafts
  private drafts = signal(new Map<string, string>());

  getDraftSignal(channelId: string) {
    return computed(() => this.drafts().get(channelId) ?? '');
  }

  setDraft(channelId: string, message: string) {
    const newDrafts = new Map(this.drafts());
    newDrafts.set(channelId, message);
    this.drafts.set(newDrafts);
  }

  clearDraft(channelId: string) {
    const newDrafts = new Map(this.drafts());
    newDrafts.delete(channelId);
    this.drafts.set(newDrafts);
  }
}
