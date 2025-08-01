import { CommonModule, NgClass } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Server, ServerUpdate } from '@common/types';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChannelCategoryService } from 'src/app/services/channel-category/channel-category.service';
import { ServerService } from 'src/app/services/server/server.service';
import { ChannelCreateDialogComponent } from '../dialogs/channel-create-dialog/channel-create-dialog.component';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { CategoryCreateDialogComponent } from '../dialogs/category-create-dialog/category-create-dialog.component';
import { ServerCreateDialogComponent } from '../dialogs/server-create-dialog/server-create-dialog.component';
import { FullscreenOverlayComponent } from '../custom/fullscreen-overlay/fullscreen-overlay.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ServerEditService } from 'src/app/services/server-edit/server-edit.service';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-server-list',
  imports: [
    NgClass,
    ButtonModule,
    CommonModule,
    ContextMenu,
    FullscreenOverlayComponent,
    DividerModule,
    ReactiveFormsModule,
  ],
  providers: [DialogService],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent implements OnInit, OnDestroy {
  private serverService = inject(ServerService);
  private serverEditService = inject(ServerEditService);
  private channelService = inject(ChannelService);
  private categoryService = inject(ChannelCategoryService);
  private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);

  //Context menu
  @ViewChild('serverContextMenu') serverContextMenu!: ContextMenu;
  protected contextMenuItems: MenuItem[] = [];

  //Channel creation
  private createChannelDialogRef!: DynamicDialogRef;

  //Category creation
  private createCategoryDialogRef!: DynamicDialogRef;

  //Server creation
  private createServerDialogRef!: DynamicDialogRef;

  //Editing servers
  protected serverEditOverlayVisible = signal(false);
  protected serverEditForm = this.formBuilder.group({
    name: new FormControl<string>(''),
    description: new FormControl<string | null | undefined>(null),
  });

  //Current values tracked
  protected servers = this.serverService.servers;
  protected currentServer = this.serverService.currentServer;
  protected contextMenuServer: Server | null = null;

  constructor() {
    effect(() => {
      if (!this.serverEditOverlayVisible()) {
        this.serverEditService.closeEdit();
        this.contextMenuServer = null;
      }
    });
  }

  selectServer(id: string) {
    this.serverService.selectServer(id);
  }

  ngOnInit(): void {
    this.initContextMenu();
  }

  ngOnDestroy(): void {
    if (this.createChannelDialogRef) this.createChannelDialogRef.close();
    if (this.createCategoryDialogRef) this.createCategoryDialogRef.close();
    if (this.createServerDialogRef) this.createServerDialogRef.close();
  }

  private initContextMenu() {
    this.contextMenuItems = [
      {
        label: 'Server Settings',
        command: () => {
          this.startServerEdit();
        },
      },
      {
        label: 'Delete Server',
        command: () => {
          this.serverContextMenu.hide();
          this.serverService.deleteServer(this.contextMenuServer!.id);
          this.contextMenuServer = null;
        },
      },
      {
        separator: true,
      },
      {
        label: 'Create Category',
        command: () => {
          this.startCategoryCreate();
        },
      },
      {
        label: 'Create Channel',
        command: () => {
          this.startChannelCreate();
        },
      },
    ];
  }

  showContextMenu(event: MouseEvent, server: Server) {
    this.contextMenuServer = server;
    this.serverContextMenu.show(event);
  }

  protected startChannelCreate() {
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
          categoryName: null,
        },
      }
    );

    this.createChannelDialogRef.onClose.subscribe((newChannelName) => {
      if (newChannelName) {
        this.channelService.createChannel(newChannelName, null);
        this.contextMenuServer = null;
      }
    });
  }

  protected startCategoryCreate() {
    this.createCategoryDialogRef = this.dialogService.open(
      CategoryCreateDialogComponent,
      {
        header: 'Create Category',
        width: '30%',
        baseZIndex: 10000,
        modal: true,
        dismissableMask: true,
        closeOnEscape: true,
        closable: true,
        styleClass: '!bg-surface-700 !pt-0',
      }
    );

    this.createCategoryDialogRef.onClose.subscribe((newCategoryName) => {
      if (newCategoryName) {
        this.categoryService.createCategory(
          this.contextMenuServer!.id,
          newCategoryName
        );
        this.contextMenuServer = null;
      }
    });
  }

  protected startServerCreate() {
    this.createServerDialogRef = this.dialogService.open(
      ServerCreateDialogComponent,
      {
        header: 'Create Server',
        width: '30%',
        baseZIndex: 10000,
        modal: true,
        dismissableMask: true,
        closeOnEscape: true,
        closable: true,
        styleClass: '!bg-surface-700 !pt-0',
      }
    );

    this.createServerDialogRef.onClose.subscribe((newServerName) => {
      if (newServerName) {
        this.serverService.createServer(newServerName);
      }
    });
  }

  private startServerEdit(): void {
    this.serverEditOverlayVisible.set(true);
    const server = this.serverService.getServerById(this.contextMenuServer!.id);

    this.serverEditForm.reset({
      name: server!.name,
      description: server!.description,
    });

    this.serverEditForm.markAsPristine();
    this.serverEditService.startEdit(this.contextMenuServer!.id);

    this.serverContextMenu.hide();
  }

  protected saveServerEdit() {
    if (this.serverEditForm.invalid) return;

    try {
      const updates: ServerUpdate = {
        name: this.serverEditForm.value.name!,
        description: this.serverEditForm.value.description!,
      };

      this.serverService.editServer(
        this.serverEditService.currentlyEditedId()!,
        updates
      );

      this.serverEditForm.markAsPristine();
    } catch (err) {
      console.error('Failed to update server:', err);
    }
  }
}
