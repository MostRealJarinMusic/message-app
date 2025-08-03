import { CommonModule, NgClass } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  input,
  Output,
  output,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Server, ServerUpdate } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FullscreenOverlayComponent } from 'src/app/shared/components/custom/fullscreen-overlay/fullscreen-overlay.component';
import { ServerEditService } from '../../services/server-edit/server-edit.service';
import { ServerService } from '../../services/server/server.service';

@Component({
  selector: 'app-server-edit-overlay',
  imports: [
    ButtonModule,
    CommonModule,
    FullscreenOverlayComponent,
    DividerModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './server-edit-overlay.component.html',
  styleUrl: './server-edit-overlay.component.scss',
})
export class ServerEditOverlayComponent {
  private formBuilder = inject(FormBuilder);
  protected serverEditService = inject(ServerEditService);

  protected serverEditForm = this.formBuilder.group({
    name: new FormControl<string>(''),
    description: new FormControl<string | null | undefined>(''),
  });

  constructor() {
    effect(() => {
      if (this.serverEditService.editActive()) {
        this.serverEditService.resetEditForm(this.serverEditForm);
      }
    });
  }
}
