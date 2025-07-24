import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-category-create-dialog',
  imports: [DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './category-create-dialog.component.html',
  styleUrl: './category-create-dialog.component.scss',
})
export class CategoryCreateDialogComponent {
  protected ref = inject(DynamicDialogRef);
  //protected config = inject(DynamicDialogConfig);

  visible = input(false);
  categoryName = '';

  protected close() {
    this.ref.close();
  }

  protected createCategory() {
    this.ref.close(this.categoryName);
  }
}
