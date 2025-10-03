import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import { ClientsService, Client } from './clients.service';

type CreateClientDto = {
  fullName: string;
  displayName?: string | null;
  email: string;
  details?: string | null;
  active?: boolean | null;
  location?: string | null;
};

type RowError = { row: number; issues: string[] };

@Component({
  selector: 'app-import-clients-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './import-clients-dialog.component.html',
  styleUrls: ['./import-clients-dialog.component.scss'],
})
export class ImportClientsDialogComponent {
  private dialogRef = inject(MatDialogRef<ImportClientsDialogComponent>);
  private snack = inject(MatSnackBar);
  private clientsService = inject(ClientsService);

  loading = signal(false);
  validRows = signal<CreateClientDto[]>([]);
  errors = signal<RowError[]>([]);

  displayedColumns = ['fullName', 'displayName', 'email', 'location', 'active'];

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loading.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        this.processRows(json);
      } catch (e) {
        this.snack.open('Failed to parse file', 'Close', { duration: 3000 });
      } finally {
        this.loading.set(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  private processRows(rows: any[]) {
    const valids: CreateClientDto[] = [];
    const errs: RowError[] = [];

    rows.forEach((raw, i) => {
      const rowNum = i + 2;
      const issues: string[] = [];

      const dto: CreateClientDto = {
        fullName: (raw.fullName ?? raw['Full Name'] ?? '').toString().trim(),
        displayName:
          (raw.displayName ?? raw['Display Name'] ?? '').toString().trim() ||
          null,
        email: (raw.email ?? raw['Email'] ?? '').toString().trim(),
        location:
          (raw.location ?? raw['Location'] ?? '').toString().trim() || null,
        details:
          (raw.details ?? raw['Details'] ?? '').toString().trim() || null,
        active: this.coerceBool(raw.active ?? raw['Active']),
      };

      // Basic validation mirroring backend
      if (!dto.fullName) issues.push('fullName is required');
      if (!dto.email) issues.push('email is required');
      if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email))
        issues.push('email is invalid');

      if (dto.fullName && dto.fullName.length > 255)
        issues.push('fullName > 255');
      if (dto.displayName && dto.displayName.length > 255)
        issues.push('displayName > 255');
      if (dto.email && dto.email.length > 255) issues.push('email > 255');
      if (dto.location && dto.location.length > 255)
        issues.push('location > 255');
      if (dto.details && dto.details.length > 1000)
        issues.push('details > 1000');

      if (issues.length) {
        errs.push({ row: rowNum, issues });
      } else {
        valids.push(dto);
      }
    });

    this.validRows.set(valids);
    this.errors.set(errs);
  }

  private coerceBool(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    const s = v?.toString().trim().toLowerCase();
    if (!s) return null;
    if (['true', '1', 'yes', 'y'].includes(s)) return true;
    if (['false', '0', 'no', 'n'].includes(s)) return false;
    return null;
  }

  import() {
    const rows = this.validRows();
    if (!rows.length) return;

    this.loading.set(true);
    this.clientsService.importClientsBulk(rows).subscribe({
      next: (created: Client[]) => {
        this.loading.set(false);
        this.snack.open(`Imported ${created.length} client(s)`, 'Close', {
          duration: 3000,
        });
        this.dialogRef.close({ count: created.length });
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open('Import failed. Check file and try again.', 'Close', {
          duration: 4000,
        });
      },
    });
  }

  close() {
    this.dialogRef.close();
  }

  downloadTemplate() {
    const rows = [
      ['fullName', 'displayName', 'email', 'location', 'details', 'active'],
      [
        'John Doe',
        'John D.',
        'john@doe.com',
        'New York, USA',
        'Notes...',
        'true',
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'clients-import-template.xlsx');
  }
}
