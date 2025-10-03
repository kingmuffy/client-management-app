import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientsService, Client } from '../clients.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';
import { ClientFormDialogComponent } from '../client-form-dialog/client-form-dialog.component';
type DialogData = { id: number } | { client: Client };

@Component({
  selector: 'app-client-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './client-detail-dialog.component.html',
  styleUrls: ['./client-detail-dialog.component.scss'],
})
export class ClientDetailDialogComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA) as DialogData;
  private clientsService = inject(ClientsService);
  dialogRef = inject(MatDialogRef<ClientDetailDialogComponent>);
  public auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  error = signal<string | null>(null);
  client = signal<Client | null>(null);

  ngOnInit(): void {
    // If the opener passed a full client, show it immediately then refresh by id (silent)
    if ('client' in this.data) {
      const incoming = this.data.client as Client;
      this.client.set(incoming);
      this.loading.set(false);
      if (incoming?.id) this.refresh(incoming.id, true);
      return;
    }

    // Else fetch by id
    if ('id' in this.data) {
      this.refresh(this.data.id);
    }
  }

  private refresh(id: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.clientsService.getClient(id).subscribe({
      next: (c) => {
        this.client.set(c);
        this.error.set(null);
        this.loading.set(false);
      },
      error: () => {
        if (!silent) {
          this.error.set('Failed to load client details.');
          this.loading.set(false);
        }
      },
    });
  }

  close(result?: any): void {
    this.dialogRef.close(result);
  }
  editClient() {
    if (!this.client()) return;

    const ref = this.dialog.open(ClientFormDialogComponent, {
      width: '520px',
      data: { mode: 'edit', client: this.client()! },
    });

    ref.afterClosed().subscribe((updated: Client | undefined) => {
      if (updated) {
        this.client.set(updated);
        this.close({ edited: true, client: updated });
        this.snack.open('Client updated', 'Close', { duration: 2500 });
      }
    });
  }
  deleteClient() {
    if (!this.client()) return;
    const id = this.client()!.id;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Client',
        message: `Are you sure you want to delete client "${
          this.client()!.fullName
        }"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clientsService.deleteClient(id).subscribe({
          next: () => {
            this.snack.open('Client deleted successfully', 'Close', {
              duration: 3000,
            });
            this.close({ deleted: true });
          },
          error: () => {
            this.snack.open('Failed to delete client', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}
