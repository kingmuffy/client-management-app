import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let comp: ConfirmDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Delete?', message: 'Really delete this?' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('renders provided title and message', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Delete?');
    expect(el.querySelector('mat-dialog-content p')?.textContent?.trim()).toBe(
      'Really delete this?'
    );
  });

  it('clicking Cancel closes with false', () => {
    const el: HTMLElement = fixture.nativeElement;
    (el.querySelector('button[mat-button]') as HTMLButtonElement).click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('clicking Yes closes with true', () => {
    const el: HTMLElement = fixture.nativeElement;
    (el.querySelector('button[color="warn"]') as HTMLButtonElement).click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('uses default title/message when none provided', async () => {
    await TestBed.resetTestingModule();

    const dialogRef2 = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef2 },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture2 = TestBed.createComponent(ConfirmDialogComponent);
    fixture2.detectChanges();

    const el: HTMLElement = fixture2.nativeElement;
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Confirm');
    expect(el.querySelector('mat-dialog-content p')?.textContent?.trim()).toBe(
      'Are you sure?'
    );
  });
});
