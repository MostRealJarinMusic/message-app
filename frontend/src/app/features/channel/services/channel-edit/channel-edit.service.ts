import { computed, effect, Injectable, signal, WritableSignal } from '@angular/core';
import { ChannelUpdate } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class ChannelEditService {
  // private editedChannelId = signal<string | null>(null);
  // private channelEdits = signal<ChannelUpdate | null>(null);
  // private initialChannelSettings = signal<ChannelUpdate | null>(null);

  // readonly currentlyEditedId = this.editedChannelId.asReadonly();

  // constructor() {
  //   effect(() => {
  //     console.log(this.isDirty());
  //   });
  // }

  // startEdit(id: string, initialChannel: ChannelUpdate) {
  //   this.editedChannelId.set(id);
  //   this.channelEdits.set(initialChannel);
  //   this.initialChannelSettings.set(initialChannel);
  // }

  // closeEdit() {
  //   this.editedChannelId.set(null);
  //   this.channelEdits.set(null);
  //   this.initialChannelSettings.set(null);
  // }

  // saveEdit(onSave: (id: string, edits: ChannelUpdate) => void) {
  //   const id = this.editedChannelId();
  //   const currentEdit = this.channelEdits();

  //   if (!id || !currentEdit) return;

  //   onSave(id, currentEdit);
  //   this.closeEdit();
  // }

  // getEdit(): WritableSignal<ChannelUpdate | null> {
  //   return this.channelEdits;
  // }

  // readonly isDirty = computed(() => {
  //   return this.channelEdits() !== this.initialChannelSettings();
  // });

  private editedChannelId = signal<string | null>(null);
  readonly currentlyEditedId = this.editedChannelId.asReadonly();

  startEdit(id: string) {
    this.editedChannelId.set(id);
  }

  closeEdit() {
    this.editedChannelId.set(null);
  }
}
