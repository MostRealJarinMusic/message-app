import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerTitleBarComponent } from './server-title-bar.component';

describe('ServerTitleBarComponent', () => {
  let component: ServerTitleBarComponent;
  let fixture: ComponentFixture<ServerTitleBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerTitleBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerTitleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
