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
  ],
  templateUrl: './client-form-dialog.component.html',
  styleUrls: ['./client-form-dialog.component.scss'],
})
export class ClientFormDialogComponent {
  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private snack = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ClientFormDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as DialogData;

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
    if (this.form.invalid) return;

    if (this.data.mode === 'add') {
      this.clientsService.addClient(this.form.value).subscribe({
        next: (created) => {
          this.snack.open('Client created successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(created);
        },
        error: () =>
          this.snack.open('Failed to create client', 'Close', {
            duration: 3000,
          }),
      });
    } else {
      const id = this.data.client.id;
      this.clientsService.updateClient(id, this.form.value).subscribe({
        next: (updated) => {
          this.snack.open('Client updated successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(updated);
        },
        error: () =>
          this.snack.open('Failed to update client', 'Close', {
            duration: 3000,
          }),
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
