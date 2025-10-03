import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api/auth/login';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string) {
    return this.http.post<LoginResponse>(this.API_URL, { email }).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser() {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
  get role(): string | null {
    return this.currentUser ? this.currentUser.role : null;
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isEditor(): boolean {
    return this.role === 'EDITOR';
  }

  isAdminOrEditor(): boolean {
    return this.role === 'ADMIN' || this.role === 'EDITOR';
  }
  get username(): string | null {
    return this.currentUser ? this.currentUser.fullName : null;
  }

  get email(): string | null {
    return this.currentUser ? this.currentUser.email : null;
  }
}
