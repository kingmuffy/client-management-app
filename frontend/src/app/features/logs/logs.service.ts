import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  actorEmail: string;
  actorName: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly API_URL = '/api/logs';

  constructor(private http: HttpClient) {}

  getLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.API_URL);
  }
}
