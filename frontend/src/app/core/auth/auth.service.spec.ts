import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const API = '/api/auth/login';
  const tokenKey = 'auth_token';
  const userKey = 'auth_user';

  const mockResp: LoginResponse = {
    token: 'tok-123',
    user: {
      id: 7,
      email: 'alice@example.com',
      fullName: 'Alice Admin',
      role: 'ADMIN',
      active: true,
    },
  };

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: router }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() stores token & user; getters reflect values', () => {
    service.login('alice@example.com').subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'alice@example.com' });

    req.flush(mockResp);

    expect(localStorage.getItem(tokenKey)).toBe('tok-123');
    expect(JSON.parse(localStorage.getItem(userKey) as string)).toEqual(
      mockResp.user
    );

    expect(service.token).toBe('tok-123');
    expect(service.currentUser).toEqual(mockResp.user);
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.username).toBe('Alice Admin');
    expect(service.email).toBe('alice@example.com');
    expect(service.role).toBe('ADMIN');
    expect(service.isAdmin()).toBeTrue();
    expect(service.isEditor()).toBeFalse();
    expect(service.isAdminOrEditor()).toBeTrue();
  });

  it('logout() clears storage and navigates to /login', () => {
    localStorage.setItem(tokenKey, 't');
    localStorage.setItem(
      userKey,
      JSON.stringify({ fullName: 'X', email: 'x@y', role: 'EDITOR' })
    );

    service.logout();

    expect(localStorage.getItem(tokenKey)).toBeNull();
    expect(localStorage.getItem(userKey)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('role helpers (EDITOR) work as expected', () => {
    localStorage.setItem(
      userKey,
      JSON.stringify({
        id: 2,
        email: 'ed@example.com',
        fullName: 'Ed Editor',
        role: 'EDITOR',
        active: true,
      })
    );

    expect(service.role).toBe('EDITOR');
    expect(service.isAdmin()).toBeFalse();
    expect(service.isEditor()).toBeTrue();
    expect(service.isAdminOrEditor()).toBeTrue();
  });

  it('isLoggedIn() is false when no token is stored', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });
});
