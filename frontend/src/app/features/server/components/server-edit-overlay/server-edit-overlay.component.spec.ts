import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerEditOverlayComponent } from './server-edit-overlay.component';

describe('ServerEditOverlayComponent', () => {
  let component: ServerEditOverlayComponent;
  let fixture: ComponentFixture<ServerEditOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerEditOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerEditOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
