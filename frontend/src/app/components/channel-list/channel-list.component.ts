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
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Channel,
  ChannelCategory,
  ChannelCategoryUpdate,
  ChannelUpdate,
} from '@common/types';
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
import { FullscreenOverlayComponent } from '../custom/fullscreen-overlay/fullscreen-overlay.component';
import { InputTextModule } from 'primeng/inputtext';
import { ChannelEditService } from 'src/app/services/channel-edit/channel-edit.service';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { CommonModule, NgClass } from '@angular/common';
import { ChannelCategoryEditService } from 'src/app/services/channel-category-edit/channel-category-edit.service';

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
    CommonModule,
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
  private categoryEditService = inject(ChannelCategoryEditService);
  private formBuilder = inject(FormBuilder);

  //Channel button context menu
  @ViewChild('channelContextMenu') channelContextMenu!: ContextMenu;
  protected channelContextMenuItems: MenuItem[] = [];

  //Creating channels
  private createChannelDialogRef!: DynamicDialogRef;

  //Editing channels - keeping track of overlay, and editing form
  protected channelEditOverlayVisible = signal(false);
  protected channelEditForm = this.formBuilder.group({
    name: new FormControl<string>(''),
    topic: new FormControl<string | null | undefined>(null),
  });

  //Category button context menu
  @ViewChild('categoryContextMenu') categoryContextMenu!: ContextMenu;
  protected categoryContextMenuItems: MenuItem[] = [];

  //Edit categories
  protected categoryEditOverlayVisible = signal(false);
  protected categoryEditForm = this.formBuilder.group({
    name: new FormControl<string>(''),
  });

  //Current values tracked
  protected categories = this.categoryService.channelCategories;
  // protected channels = this.channelService.channels;
  protected groupedChannels = this.channelService.groupedChannels;
  protected currentChannel = this.channelService.currentChannel;
  protected contextMenuChannel: Channel | null = null;
  protected contextMenuCategory: ChannelCategory | null = null;

  constructor() {
    effect(() => {
      if (!this.channelEditOverlayVisible()) {
        this.channelEditService.closeEdit();
        this.contextMenuChannel = null;
      }
    });

    effect(() => {
      if (!this.categoryEditOverlayVisible()) {
        this.categoryEditService.closeEdit();
        this.contextMenuCategory = null;
      }
    });
  }

  ngOnInit(): void {
    this.initChannelContextMenu();
    this.initCategoryContextMenu();
  }

  ngOnDestroy(): void {
    if (this.createChannelDialogRef) this.createChannelDialogRef.close();
  }

  private initChannelContextMenu(): void {
    this.channelContextMenuItems = [
      {
        label: 'Edit Channel',
        command: () => {
          this.startChannelEdit();
        },
      },

      {
        label: 'Delete Channel',
        command: () => {
          this.channelService.deleteChannel(this.contextMenuChannel!.id);
          this.contextMenuChannel = null;
        },
      },
      {
        separator: true,
      },
      {
        label: 'Copy Channel ID',
        command: () => {},
      },
    ];
  }

  private initCategoryContextMenu(): void {
    this.categoryContextMenuItems = [
      {
        label: 'Edit Category',
        command: () => {
          // this.categoryService.editCategory(this.contextMenuCategory!.id, {
          //   name: 'TESTING',
          // });
          this.startCategoryEdit();
        },
      },
      {
        label: 'Delete Category',
        command: () => {
          this.categoryService.deleteCategory(this.contextMenuCategory!.id);
          this.contextMenuCategory = null;
        },
      },
      {
        separator: true,
      },
      {
        label: 'Copy Category ID',
        command: () => {},
      },
    ];
  }

  protected showChannelContextMenu(event: MouseEvent, channel: Channel) {
    this.contextMenuChannel = channel;
    this.channelContextMenu.show(event);
  }

  protected startChannelCreate(categoryId: string) {
    this.createChannelDialogRef = this.dialogService.open(
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

    this.createChannelDialogRef.onClose.subscribe((newChannelName) => {
      if (newChannelName) {
        console.log('Dialog closed with:', newChannelName);
        this.channelService.createChannel(newChannelName, categoryId);
      } else {
        console.log('Dialog closed - no channel created.');
      }
    });
  }

  private startChannelEdit(): void {
    //Open the channel editor overlay
    this.channelEditOverlayVisible.set(true);
    const channel = this.channelService.getChannelById(
      this.contextMenuChannel!.id
    );

    this.channelEditForm.reset({
      name: channel!.name,
      topic: channel!.topic ?? null,
    });

    this.channelEditForm.markAsPristine();
    this.channelEditService.startEdit(this.contextMenuChannel!.id);

    this.channelContextMenu.hide();
  }

  protected saveChannelEdit() {
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

      //this.channelEditOverlayVisible.set(false);
      this.channelEditForm.markAsPristine();
    } catch (err) {
      console.error('Failed to update channel:', err);
    }
  }

  protected selectChannel(id: string) {
    this.channelService.selectChannel(id);
  }

  protected showCategoryContextMenu(
    event: MouseEvent,
    category: ChannelCategory
  ) {
    event.preventDefault();
    this.contextMenuCategory = category;
    this.categoryContextMenu.show(event);
  }

  protected startCategoryEdit(): void {
    this.categoryEditOverlayVisible.set(true);
    const category = this.categoryService.getCategoryById(
      this.contextMenuCategory!.id
    );

    this.categoryEditForm.reset({
      name: category!.name,
    });

    this.categoryEditForm.markAsPristine();
    this.categoryEditService.startEdit(this.contextMenuCategory!.id);

    this.categoryContextMenu.hide();
  }

  protected saveCategoryEdit() {
    if (this.categoryEditForm.invalid) return;

    try {
      const updates: ChannelCategoryUpdate = {
        name: this.categoryEditForm.value.name!,
      };

      this.categoryService.editCategory(
        this.categoryEditService.currentlyEditedId()!,
        updates
      );

      this.categoryEditForm.markAsPristine();
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  }
}
