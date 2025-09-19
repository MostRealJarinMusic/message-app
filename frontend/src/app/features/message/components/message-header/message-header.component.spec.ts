import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageHeaderComponent } from './message-header.component';

describe('MessageHeaderComponent', () => {
  let component: MessageHeaderComponent;
  let fixture: ComponentFixture<MessageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
