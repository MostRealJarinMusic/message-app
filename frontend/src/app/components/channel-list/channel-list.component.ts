import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Channel, ChannelUpdate } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { ListboxModule } from 'primeng/listbox';
import { AccordionModule } from 'primeng/accordion';
import { AccordionPanelComponent } from '../custom/accordion-panel/accordion-panel.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChannelCreateDialogComponent } from '../dialogs/channel-create-dialog/channel-create-dialog.component';
import { ChannelCategoryService } from 'src/app/services/channel-category/channel-category.service';
import { ChannelButtonComponent } from '../channel-button/channel-button.component';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { FullscreenOverlayComponent } from '../custom/fullscreen-overlay/fullscreen-overlay.component';
import { InputTextModule } from 'primeng/inputtext';
import { ChannelEditService } from 'src/app/services/channel-edit/channel-edit.service';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-channel-list',
  imports: [
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ListboxModule,
    AccordionModule,
    AccordionPanelComponent,
    ChannelButtonComponent,
    ContextMenu,
    FullscreenOverlayComponent,
    InputTextModule,
    TextareaModule,
    DividerModule,
  ],
  providers: [DialogService],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
})
export class ChannelListComponent implements OnDestroy, OnInit {
  private dialogService = inject(DialogService);
  private channelService = inject(ChannelService);
  private channelEditService = inject(ChannelEditService);
  private categoryService = inject(ChannelCategoryService);
  private formBuilder = inject(FormBuilder);

  protected createDialogRef!: DynamicDialogRef;
  @ViewChild('cm') cm!: ContextMenu;
  contextMenuItems: MenuItem[] = [];

  protected categories = this.categoryService.channelCategories;
  protected channels = this.channelService.channels;
  protected currentChannel = this.channelService.currentChannel;
  protected contextMenuChannel: Channel | null = null;

  protected editOverlayVisible = signal(false);

  protected channelEditForm = this.formBuilder.group({
    name: new FormControl<string>(''),
    topic: new FormControl<string | null | undefined>(null),
  });
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.editOverlayVisible()) {
        this.channelEditService.closeEdit();
      }
    });
  }

  protected groupedChannels = computed(() => {
    const map = new Map<string | null, Channel[]>();

    for (const channel of this.channels()) {
      const key = channel.categoryId ?? null;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(channel);
    }

    return map;
  });

  selectChannel(id: string) {
    this.channelService.selectChannel(id);
  }

  onChannelChange(event: any) {
    const selected: Channel = event.value;
    this.selectChannel(selected.id);
  }

  protected startCreateChannel(categoryId: string) {
    this.showCreateDialog(categoryId);
  }

  showCreateDialog(categoryId: string) {
    this.createDialogRef = this.dialogService.open(
      ChannelCreateDialogComponent,
      {
        header: 'Create Channel',
        width: '30%',
        baseZIndex: 10000,
        modal: true,
        dismissableMask: true,
        closeOnEscape: true,
        closable: true,
        styleClass: '!bg-surface-700 !pt-0',
        data: {
          categoryName: this.categoryService.getCategoryName(categoryId),
        },
      }
    );

    this.createDialogRef.onClose.subscribe((newChannelName) => {
      if (newChannelName) {
        console.log('Dialog closed with:', newChannelName);
        this.channelService.createChannel(newChannelName, categoryId);
      } else {
        console.log('Dialog closed - no channel created.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.createDialogRef) this.createDialogRef.close();
  }

  ngOnInit(): void {
    this.contextMenuItems = [
      {
        label: 'Edit Channel',
        icon: 'pi pi-trash',
        command: () => {
          //this.router.navigate(['/channel/edit', this.contextMenuChannel!.id]);
          //Open the channel editor overlay
          this.editOverlayVisible.set(true);
          const channel = this.channelService.getChannelById(
            this.contextMenuChannel!.id
          );

          this.channelEditForm.reset({
            name: channel!.name,
            topic: channel!.topic ?? null,
          });

          this.channelEditForm.markAsPristine();
          this.channelEditService.startEdit(this.contextMenuChannel!.id);

          this.cm.hide();
        },
      },
      {
        separator: true,
      },
      {
        label: 'Delete Channel',
        icon: 'pi pi-pencil',
        command: () => {
          this.channelService.deleteChannel(this.contextMenuChannel!.id);
        },
      },
    ];
  }

  showContextMenu(event: MouseEvent, channel: Channel) {
    this.contextMenuChannel = channel;
    this.cm.show(event);
  }

  protected async saveChannelEdit() {
    if (this.channelEditForm.invalid) return;

    try {
      const updates: ChannelUpdate = {
        name: this.channelEditForm.value.name!,
        topic: this.channelEditForm.value.topic!,
      };

      this.channelService.editChannel(
        this.channelEditService.currentlyEditedId()!,
        updates
      );

      //this.editOverlayVisible.set(false);
      this.channelEditForm.markAsPristine();
    } catch (err) {
      console.error('Failed to update channel:', err);
    }
  }
}
