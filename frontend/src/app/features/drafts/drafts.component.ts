import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DraftsService, Draft } from './drafts.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.scss'],
})
export class DraftsComponent implements OnInit {
  private readonly draftsService = inject(DraftsService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly auth = inject(AuthService);

  drafts = signal<Draft[]>([]);
  loading = signal(true);

  displayedColumns = [
    'id',
    'fullName',
    'email',
    'location',
    'createdByEmail',
    'updatedAt',
    'actions',
  ];

  get canManage() {
    return this.auth.isAdminOrEditor?.() ?? false;
  }

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts() {
    this.loading.set(true);
    this.draftsService.getAllDrafts().subscribe({
      next: (data) => {
        this.drafts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load drafts', 'Close', { duration: 3000 });
      },
    });
  }

  deleteDraft(draft: Draft, ev?: MouseEvent) {
    ev?.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Draft',
        message: `Are you sure you want to delete "${draft.fullName}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.draftsService.deleteDraft(draft.id).subscribe({
          next: () => {
            this.drafts.update((list) => list.filter((d) => d.id !== draft.id));
            this.snack.open('Draft deleted', 'Close', { duration: 2500 });
          },
          error: () => {
            this.snack.open('Failed to delete draft', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  viewDraft(draft: Draft) {
    this.snack.open(`Draft "${draft.fullName}" clicked`, '', {
      duration: 1500,
    });
  }
}
