import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { ClientsService } from '../clients/clients.service';
import { LogsService, AuditLog } from '../logs/logs.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly logsService = inject(LogsService);

  loading = signal(true);
  totalClients = signal(0);
  activeClients = signal(0);
  inactiveClients = signal(0);
  clientsByLocation = signal<{ name: string; value: number }[]>([]);
  recentLogs = signal<AuditLog[]>([]);

  colorScheme: Color = {
    name: 'clientAnalytics',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1976d2', '#43a047', '#ef6c00', '#9c27b0', '#c62828'],
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.totalClients.set(clients.length);
        this.activeClients.set(clients.filter((c) => c.active).length);
        this.inactiveClients.set(clients.filter((c) => !c.active).length);

        const locationMap: Record<string, number> = {};
        for (const c of clients) {
          const key = c.location?.trim() || 'Unknown';
          locationMap[key] = (locationMap[key] || 0) + 1;
        }

        this.clientsByLocation.set(
          Object.entries(locationMap).map(([name, value]) => ({ name, value }))
        );

        this.logsService.getLogs().subscribe({
          next: (logs) => {
            this.recentLogs.set(logs.slice(0, 5));
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
