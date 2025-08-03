import { computed, Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageEditService {
  private editedMessageId = signal<string | null>(null);
  private editContent = signal<string>('');

  readonly currentlyEditedId = this.editedMessageId.asReadonly();
  readonly isDirty = computed(() => {
    return this.editedMessageId() !== null && this.editContent().trim() !== '';
  });

  isEditing(id: string): boolean {
    return this.currentlyEditedId() === id;
  }

  startEdit(id: string, initialContent: string) {
    this.editedMessageId.set(id);
    this.editContent.set(initialContent);
  }

  closeEdit() {
    this.editedMessageId.set(null);
    this.editContent.set('');
  }

  saveEdit(onSave: (id: string, content: string) => void) {
    const id = this.editedMessageId();
    const currentContent = this.editContent().trim();

    if (!id) return;

    onSave(id, currentContent);
    this.closeEdit();
  }

  getContent(): WritableSignal<string> {
    return this.editContent;
  }
}
