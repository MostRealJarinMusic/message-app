import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelCreateDialogComponent } from './channel-create-dialog.component';

describe('ChannelCreateDialogComponent', () => {
  let component: ChannelCreateDialogComponent;
  let fixture: ComponentFixture<ChannelCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelCreateDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
