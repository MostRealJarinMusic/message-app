import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenOverlayComponent } from './fullscreen-overlay.component';

describe('FullscreenOverlayComponent', () => {
  let component: FullscreenOverlayComponent;
  let fixture: ComponentFixture<FullscreenOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullscreenOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FullscreenOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
