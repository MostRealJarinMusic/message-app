import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelTitleBarComponent } from './channel-title-bar.component';

describe('ChannelTitleBarComponent', () => {
  let component: ChannelTitleBarComponent;
  let fixture: ComponentFixture<ChannelTitleBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelTitleBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelTitleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
