import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChannelCategoryEditService {
  private editedCategoryId = signal<string | null>(null);
  readonly currentlyEditedId = this.editedCategoryId.asReadonly();

  startEdit(id: string) {
    this.editedCategoryId.set(id);
  }

  closeEdit() {
    this.editedCategoryId.set(null);
  }
}
