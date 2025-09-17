import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyPreviewComponent } from './reply-preview.component';

describe('ReplyPreviewComponent', () => {
  let component: ReplyPreviewComponent;
  let fixture: ComponentFixture<ReplyPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
