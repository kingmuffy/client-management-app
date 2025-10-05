import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  title = 'Client Management App';
  auth = inject(AuthService);
  private router = inject(Router);
  get isAdmin() {
    return this.auth.isAdmin();
  }
  get isEditor() {
    return this.auth.isEditor();
  }
  get isViewer() {
    return this.auth.isLoggedIn() && !this.auth.isAdminOrEditor();
  }

  logout() {
    this.auth.logout();
  }
  get initial(): string {
    const name = this.auth.username ?? '';
    return name ? name.charAt(0).toUpperCase() : '?';
  }
  goHome() {
    this.router.navigateByUrl(this.auth.isLoggedIn() ? '/clients' : '/login');
  }
}
