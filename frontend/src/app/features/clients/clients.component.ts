import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ClientsService, Client } from './clients.service';
@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  loading = true;

  constructor(private clientsService: ClientsService) {}

  ngOnInit() {
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load clients');
      },
    });
  }
}
