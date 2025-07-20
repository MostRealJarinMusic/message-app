import { Injectable, signal, WritableSignal } from '@angular/core';
import { ChannelUpdate } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class ChannelEditService {
  private editedChannelId = signal<string | null>(null);
  private channelEdits = signal<ChannelUpdate | null>(null);

  readonly currentlyEditedId = this.editedChannelId.asReadonly();

  startEdit(id: string, initialChannel: ChannelUpdate) {
    this.editedChannelId.set(id);
    this.channelEdits.set(initialChannel);
  }

  closeEdit() {
    this.editedChannelId.set(null);
    this.channelEdits.set(null);
  }

  saveEdit(onSave: (id: string, edits: ChannelUpdate) => void) {
    const id = this.editedChannelId();
    const currentEdit = this.channelEdits();

    if (!id || !currentEdit) return;

    onSave(id, currentEdit);
    this.closeEdit();
  }

  getEdit(): WritableSignal<ChannelUpdate | null> {
    return this.channelEdits;
  }
}
