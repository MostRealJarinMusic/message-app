import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedHostComponent } from './embed-host.component';

describe('EmbedHostComponent', () => {
  let component: EmbedHostComponent;
  let fixture: ComponentFixture<EmbedHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmbedHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
