import {
  Component,
  effect,
  EventEmitter,
  Input,
  input,
  Output,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-fullscreen-overlay',
  imports: [ButtonModule],
  templateUrl: './fullscreen-overlay.component.html',
  styleUrl: './fullscreen-overlay.component.scss',
})
export class FullscreenOverlayComponent {
  //visible = signal(false);
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  //visibleChange = output<boolean>();

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  constructor() {
    // effect(() => {
    //   if (this.visible) {
    //     const handler = (e: KeyboardEvent) => {
    //       if (e.key === 'Escape') this.close();
    //     };
    //     window.addEventListener('keydown', handler);
    //     return () => window.removeEventListener('keydown', handler);
    //   }
    //   return;
    // });
  }
}
