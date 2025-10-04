import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftDetailDialogComponent } from './draft-detail-dialog.component';

describe('DraftDetailDialogComponent', () => {
  let component: DraftDetailDialogComponent;
  let fixture: ComponentFixture<DraftDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DraftDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
