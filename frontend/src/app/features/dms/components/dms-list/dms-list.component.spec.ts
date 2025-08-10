import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DMsListComponent } from './dms-list.component';

describe('DMsListComponent', () => {
  let component: DMsListComponent;
  let fixture: ComponentFixture<DMsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DMsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DMsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
