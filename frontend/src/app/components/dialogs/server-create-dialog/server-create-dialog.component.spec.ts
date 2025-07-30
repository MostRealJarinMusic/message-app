import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerCreateDialogComponent } from './server-create-dialog.component';

describe('ServerCreateDialogComponent', () => {
  let component: ServerCreateDialogComponent;
  let fixture: ComponentFixture<ServerCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
