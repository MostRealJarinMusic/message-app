import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSettingsOverlayComponent } from './user-settings-overlay.component';

describe('UserSettingsOverlayComponent', () => {
  let component: UserSettingsOverlayComponent;
  let fixture: ComponentFixture<UserSettingsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettingsOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSettingsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
