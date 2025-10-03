import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clients-toolbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './clients-toolbar.component.html',
  styleUrls: ['./clients-toolbar.component.scss'],
})
export class ClientsToolbarComponent {
  @Output() createClient = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<string>();
  @Output() exportFile = new EventEmitter<string>();
}
