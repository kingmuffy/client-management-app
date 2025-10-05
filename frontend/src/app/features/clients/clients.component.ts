import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ClientsService, Client } from './clients.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientDetailDialogComponent } from './client-detail-dialog/client-detail-dialog.component';
import { AuthService } from '../../core/auth/auth.service';
import { ClientFormDialogComponent } from './client-form-dialog/client-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { ClientsToolbarComponent } from './clients-toolbar/clients-toolbar.component';
import { ImportClientsDialogComponent } from './import-clients-dialog.component';
import * as XLSX from 'xlsx';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { BreakpointObserver } from '@angular/cdk/layout';
type ColumnKey = keyof Client | 'actions';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    ClientsToolbarComponent,
    ImportClientsDialogComponent,
    HighlightPipe,
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent implements OnInit {
  clients = signal<Client[]>([]);
  filterValue = signal('');
  loading = signal(true);
  clientCount = signal(0);

  sortActive = signal<keyof Client | ''>('');
  sortDirection = signal<'asc' | 'desc' | ''>('');
  private bp = inject(BreakpointObserver);
  isSmall = signal(false);

  pageIndex = signal(0);
  pageSize = signal(5);

  displayedColumns = computed<ColumnKey[]>(() => {
    const baseLarge: ColumnKey[] = [
      'id',
      'fullName',
      'displayName',
      'email',
      'location',
      'active',
    ];
    const baseSmall: ColumnKey[] = ['id', 'fullName', 'email', 'active'];
    const cols: ColumnKey[] = this.isSmall() ? [...baseSmall] : [...baseLarge];
    if (this.canManage) cols.push('actions');
    return cols;
  });

  filteredClients = computed(() => {
    let data = this.clients();

    const filter = this.filterValue().toLowerCase();
    if (filter) {
      data = data.filter((c) =>
        [c.fullName, c.displayName, c.email, c.location]
          .filter(Boolean)
          .some((val) => val.toLowerCase().includes(filter))
      );
    }

    if (this.sortActive() && this.sortDirection()) {
      data = [...data].sort((a, b) => {
        const key = this.sortActive() as keyof Client;
        const valueA = (a[key] ?? '').toString().toLowerCase();
        const valueB = (b[key] ?? '').toString().toLowerCase();
        const comparison = valueA.localeCompare(valueB);
        return this.sortDirection() === 'asc' ? comparison : -comparison;
      });
    }

    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return data.slice(start, end);
  });

  constructor(
    private clientsService: ClientsService,
    private dialog: MatDialog,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {
    this.bp.observe(['(max-width: 768px)']).subscribe((r) => {
      this.isSmall.set(r.matches);
    });
  }
  get canManage() {
    return this.auth.isAdminOrEditor?.() ?? false;
  }

  ngOnInit() {
    this.loadClients();
    this.clientsService.getClientCount().subscribe({
      next: (count) => this.clientCount.set(count),
    });
  }

  loadClients() {
    this.loading.set(true);
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to load clients');
      },
    });
  }

  applyFilter(event: Event) {
    this.filterValue.set((event.target as HTMLInputElement).value.trim());
    this.pageIndex.set(0);
  }

  onSortChange(sort: Sort) {
    this.sortActive.set((sort.active as keyof Client) || '');
    this.sortDirection.set(sort.direction as 'asc' | 'desc' | '');
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  trackById(index: number, client: Client): number {
    return client.id;
  }
  openDetail(row: Client) {
    const dialogRef = this.dialog.open(ClientDetailDialogComponent, {
      data: { client: row },
      width: '520px',
      autoFocus: false,
      restoreFocus: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.deleted || result?.edited) {
        this.loadClients();
      }
    });
  }
  editClient(client: Client, ev?: MouseEvent) {
    ev?.stopPropagation();
    if (!this.canManage) return;

    const ref = this.dialog.open(ClientFormDialogComponent, {
      width: '520px',
      data: { mode: 'edit', client },
    });

    ref.afterClosed().subscribe((updated: Client | undefined) => {
      if (updated) {
        this.clients.update((list) =>
          list.map((c) => (c.id === updated.id ? updated : c))
        );
        this.snack.open('Client updated', 'Close', { duration: 2500 });
      }
    });
  }

  deleteClient(client: Client, ev?: MouseEvent) {
    ev?.stopPropagation();
    if (!this.canManage) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Client',
        message: `Are you sure you want to delete "${client.fullName}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clientsService.deleteClient(client.id).subscribe({
          next: () => {
            this.clients.update((list) =>
              list.filter((c) => c.id !== client.id)
            );
            this.clientCount.update((n) => Math.max(0, n - 1));
            this.snack.open('Client deleted', 'Close', { duration: 2500 });
          },
          error: () =>
            this.snack.open('Failed to delete client', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }
  openAddClient() {
    if (!this.canManage) return;

    const ref = this.dialog.open(ClientFormDialogComponent, {
      width: '520px',
      data: { mode: 'add' },
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result && typeof result === 'object' && 'id' in result) {
        const created = result as Client;
        this.clients.update((list) => [...list, created]);
        this.clientCount.update((n) => n + 1);
        this.snack.open('Client created', 'Close', { duration: 2500 });
        return;
      }
    });
  }
  handleUpload(format: string) {
    console.log('Upload clicked with', format);

    const ref = this.dialog.open(ImportClientsDialogComponent, {
      width: '720px',
      autoFocus: false,
      restoreFocus: false,
      data: { format },
    });

    ref.afterClosed().subscribe((res) => {
      if (res?.count) {
        this.snack.open(`Imported ${res.count} client(s)`, 'Close', {
          duration: 3000,
        });
        this.loadClients();
      }
    });
  }

  handleExport(format: string) {
    const data = this.clients();

    if (!data.length) {
      this.snack.open('No clients to export', 'Close', { duration: 2500 });
      return;
    }

    const rows = data.map((c) => ({
      fullName: c.fullName,
      displayName: c.displayName,
      email: c.email,
      location: c.location,
      details: c.details,
      active: c.active ? 'true' : 'false',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');

    if (format === 'excel') {
      XLSX.writeFile(wb, 'clients.xlsx');
    } else {
      XLSX.writeFile(wb, 'clients.csv');
    }

    this.snack.open(
      `Exported ${rows.length} client(s) as ${format.toUpperCase()}`,
      'Close',
      {
        duration: 3000,
      }
    );
  }
}
