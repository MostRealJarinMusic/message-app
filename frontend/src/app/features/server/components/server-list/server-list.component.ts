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
import { Server } from '@common/types';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerService } from 'src/app/features/server/services/server/server.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ServerEditService } from 'src/app/features/server/services/server-edit/server-edit.service';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';
import { ChannelCategoryService } from 'src/app/features/category/services/channel-category/channel-category.service';
import { CategoryCreateDialogComponent } from 'src/app/components/dialogs/category-create-dialog/category-create-dialog.component';
import { ChannelCreateDialogComponent } from 'src/app/components/dialogs/channel-create-dialog/channel-create-dialog.component';
import { ServerCreateDialogComponent } from 'src/app/components/dialogs/server-create-dialog/server-create-dialog.component';
import { ServerEditOverlayComponent } from '../server-edit-overlay/server-edit-overlay.component';

@Component({
  selector: 'app-server-list',
  imports: [
    NgClass,
    ButtonModule,
    CommonModule,
    ContextMenu,
    ServerEditOverlayComponent,
    DividerModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
  ],
  providers: [DialogService],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss',
})
export class ServerListComponent implements OnInit, OnDestroy {
  protected serverService = inject(ServerService);
  protected serverEditService = inject(ServerEditService);
  private channelService = inject(ChannelService);
  private categoryService = inject(ChannelCategoryService);
  private dialogService = inject(DialogService);

  //Context menu
  @ViewChild('serverContextMenu') serverContextMenu!: ContextMenu;
  protected contextMenuItems: MenuItem[] = [];

  //Channel creation
  private createChannelDialogRef!: DynamicDialogRef;

  //Category creation
  private createCategoryDialogRef!: DynamicDialogRef;

  //Server creation
  private createServerDialogRef!: DynamicDialogRef;

  //Current values tracked
  protected servers = this.serverService.servers;
  protected currentServer = this.serverService.currentServer;
  protected contextMenuServer: Server | null = null;

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
          this.serverContextMenu.hide();
          this.serverEditService.startEdit(this.contextMenuServer!.id);
          this.contextMenuServer = null;
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

  protected showContextMenu(event: MouseEvent, server: Server) {
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
}
