import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClientsService, Client } from '../clients.service';
import { DraftsService } from '../../drafts/drafts.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
type DialogData = { mode: 'add' } | { mode: 'edit'; client: Client };

@Component({
  selector: 'app-client-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './client-form-dialog.component.html',
  styleUrls: ['./client-form-dialog.component.scss'],
})
export class ClientFormDialogComponent {
  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private draftsService = inject(DraftsService);
  private snack = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ClientFormDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as DialogData;
  isSaving = false;
  isDrafting = false;
  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    location: [''],
    details: [''],
    active: [true],
  });

  constructor() {
    if (this.data.mode === 'edit') {
      this.form.patchValue(this.data.client);
    }
  }

  save() {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;

    const dto = Object.fromEntries(
      Object.entries(this.form.value).map(([k, v]) => [k, v ?? ''])
    );

    if (this.data.mode === 'add') {
      this.clientsService.addClient(dto as any).subscribe({
        next: (created) => {
          this.snack.open('Client created successfully', 'Close', {
            duration: 2500,
          });
          this.dialogRef.close(created);
        },
        error: () => {
          this.snack.open('Failed to create client', 'Close', {
            duration: 3000,
          });
          this.isSaving = false;
        },
      });
    } else {
      const id = this.data.client.id;
      this.clientsService.updateClient(id, dto as any).subscribe({
        next: (updated) => {
          this.snack.open('Client updated successfully', 'Close', {
            duration: 2500,
          });
          this.dialogRef.close(updated);
        },
        error: () => {
          this.snack.open('Failed to update client', 'Close', {
            duration: 3000,
          });
          this.isSaving = false;
        },
      });
    }
  }
  saveAsDraft() {
    console.log('Clicked saveAsDraft');

    if (this.isDrafting) return;

    const fullNameCtrl = this.form.get('fullName');
    const emailCtrl = this.form.get('email');

    if (fullNameCtrl?.invalid || emailCtrl?.invalid) {
      fullNameCtrl?.markAsTouched();
      emailCtrl?.markAsTouched();
      this.snack.open(
        'Enter full name and a valid email to save a draft.',
        'Close',
        {
          duration: 2500,
        }
      );
      return;
    }

    this.isDrafting = true;

    const dto = Object.fromEntries(
      Object.entries(this.form.value).map(([k, v]) => [k, v ?? ''])
    );

    this.draftsService.createDraft(dto as any).subscribe({
      next: (res) => {
        this.snack.open('Draft saved successfully', 'Close', {
          duration: 2500,
        });
        this.isDrafting = false;
        this.dialogRef.close({ draft: res });
      },
      error: (err) => {
        console.error('Failed to save draft:', err);
        this.snack.open('Failed to save draft', 'Close', { duration: 3000 });
        this.isDrafting = false;
      },
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
