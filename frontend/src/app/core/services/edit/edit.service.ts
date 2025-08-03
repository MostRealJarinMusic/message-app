import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditService<T> {
  private editedId = signal<string | null>(null);
  private editedData = signal<T | null>(null);
  private initialData = signal<T | null>(null);

  readonly currentlyEditedId = this.editedId.asReadonly();
  readonly currentlyEditedData = this.editedData.asReadonly();
  readonly currentInitialData = this.initialData.asReadonly();
  readonly isDirty = computed(() => {
    return this.editedId() !== null && this.editedData() !== this.initialData();
  });

  constructor() {}

  isEditing(id: string): boolean {
    return this.currentlyEditedId() === id;
  }

  startEdit(id: string, data: T) {
    this.editedId.set(id);
    this.editedData.set(data);
    this.initialData.set(data);
  }

  closeEdit() {
    this.editedId.set(null);
    this.editedData.set(null);
    this.initialData.set(null);
  }

  saveEdit(onSave: (id: string, data: T) => void) {
    const id = this.editedId();

    if (!id || !this.editedData()) return;

    onSave(id, this.editedData()!);

    //Close edit here?
  }
}
