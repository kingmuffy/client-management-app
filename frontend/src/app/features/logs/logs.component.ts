import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { LogsService, AuditLog } from './logs.service';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    HighlightPipe,
  ],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {
  private readonly logsService = inject(LogsService);
  private readonly snack = inject(MatSnackBar);

  logs = signal<AuditLog[]>([]);
  filterValue = signal('');
  actionFilter = signal('');
  loading = signal(true);

  displayedColumns = ['timestamp', 'action', 'entity', 'user'];

  filteredLogs = computed(() => {
    const search = this.filterValue().toLowerCase();
    const selectedAction = this.actionFilter();
    let data = this.logs();

    if (selectedAction) {
      data = data.filter((log) => log.action === selectedAction);
    }

    if (search) {
      data = data.filter(
        (log) =>
          log.action.toLowerCase().includes(search) ||
          log.entityType.toLowerCase().includes(search) ||
          log.actorEmail.toLowerCase().includes(search) ||
          (log.actorName ?? '').toLowerCase().includes(search)
      );
    }

    return [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading.set(true);
    this.logsService.getLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load logs', 'Close', { duration: 3000 });
      },
    });
  }

  applyFilter(event: Event) {
    this.filterValue.set((event.target as HTMLInputElement).value.trim());
  }

  applyFilterAction() {}

  formatTimestamp(ts: string): string {
    return formatDate(ts, 'medium', 'en-US');
  }
}
