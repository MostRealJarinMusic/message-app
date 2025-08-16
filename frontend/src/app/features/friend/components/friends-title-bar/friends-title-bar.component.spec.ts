import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsTitleBarComponent } from './friends-title-bar.component';

describe('FriendsTitleBarComponent', () => {
  let component: FriendsTitleBarComponent;
  let fixture: ComponentFixture<FriendsTitleBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsTitleBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendsTitleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
