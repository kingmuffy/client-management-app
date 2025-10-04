import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DraftsService } from '../drafts.service';
import { ClientsService } from '../../clients/clients.service';

@Component({
  selector: 'app-draft-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  templateUrl: './draft-detail-dialog.component.html',
  styleUrls: ['./draft-detail-dialog.component.scss'],
})
export class DraftDetailDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly draftsService = inject(DraftsService);
  private readonly clientsService = inject(ClientsService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<DraftDetailDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as any;

  form = this.fb.group({
    fullName: ['', Validators.required],
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    details: [''],
    location: [''],
    active: [true],
  });

  constructor() {
    if (this.data?.draft) {
      this.form.patchValue(this.data.draft);
    }
  }

  saveDraft() {
    if (this.form.invalid) return;

    const updated = { ...this.data.draft, ...this.form.value };
    this.draftsService.updateDraft(this.data.draft.id, updated).subscribe({
      next: (res) => {
        this.snack.open('Draft updated successfully', 'Close', {
          duration: 2500,
        });
        this.dialogRef.close({ updated: res });
      },
      error: () =>
        this.snack.open('Failed to update draft', 'Close', { duration: 3000 }),
    });
  }

  postAsClient() {
    if (this.form.invalid) return;

    // convert nulls to empty strings
    const dto = Object.fromEntries(
      Object.entries(this.form.value).map(([k, v]) => [k, v ?? ''])
    );

    this.clientsService.addClient(dto as any).subscribe({
      next: () => {
        this.draftsService.deleteDraft(this.data.draft.id).subscribe(() => {
          this.snack.open('Draft posted as client', 'Close', {
            duration: 2500,
          });
          this.dialogRef.close({ posted: true });
        });
      },
      error: () =>
        this.snack.open('Failed to post as client', 'Close', {
          duration: 3000,
        }),
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
