import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, output, Output, signal } from '@angular/core';

@Component({
  selector: 'app-accordion-panel',
  imports: [CommonModule],
  templateUrl: './accordion-panel.component.html',
  styleUrl: './accordion-panel.component.scss',
})
export class AccordionPanelComponent {
  header = input<string>();
  add = output<void>();

  private open = signal(true);
  isOpen = this.open.asReadonly();

  protected toggle() {
    this.open.update((v) => !v);
  }

  protected handleAdd(event: MouseEvent) {
    event.stopPropagation();
    this.add.emit();
  }
}
