import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailDialogComponent } from './client-detail-dialog.component';

describe('ClientDetailDialogComponent', () => {
  let component: ClientDetailDialogComponent;
  let fixture: ComponentFixture<ClientDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
