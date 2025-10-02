import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ClientsService, Client } from './clients.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientDetailDialogComponent } from './client-detail-dialog/client-detail-dialog.component';

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

  pageIndex = signal(0);
  pageSize = signal(5);

  displayedColumns: (keyof Client)[] = [
    'id',
    'fullName',
    'displayName',
    'email',
    'location',
    'active',
  ];

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
    private dialog: MatDialog
  ) {}

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
    this.dialog.open(ClientDetailDialogComponent, {
      data: { client: row },
      width: '520px',
      autoFocus: false,
      restoreFocus: true,
    });
  }
}
