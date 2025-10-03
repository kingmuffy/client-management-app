import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-clients-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './clients-toolbar.component.html',
  styleUrls: ['./clients-toolbar.component.scss'],
})
export class ClientsToolbarComponent {
  @Output() createClient = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<string>();
  @Output() exportFile = new EventEmitter<string>();
  @Input() canManage = false;
}
