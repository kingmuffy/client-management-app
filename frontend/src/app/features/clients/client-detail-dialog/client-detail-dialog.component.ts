import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientsService, Client } from '../clients.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  ],
  templateUrl: './client-detail-dialog.component.html',
  styleUrls: ['./client-detail-dialog.component.scss'],
})
export class ClientDetailDialogComponent implements OnInit {
  private data = inject(MAT_DIALOG_DATA) as DialogData;
  private clientsService = inject(ClientsService);
  dialogRef = inject(MatDialogRef<ClientDetailDialogComponent>);
  public auth = inject(AuthService);

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

  close(): void {
    this.dialogRef.close();
  }
  editClient() {
    if (!this.client()) return;
    console.log('Editing client:', this.client());
  }

  deleteClient() {
    if (!this.client()) return;
    const id = this.client()!.id;
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientsService.deleteClient(id).subscribe({
        next: () => {
          alert('Client deleted successfully');
          this.close();
        },
        error: () => alert('Failed to delete client'),
      });
    }
  }
}
