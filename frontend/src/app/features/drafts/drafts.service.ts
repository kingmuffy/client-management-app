import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Draft {
  id: number;
  fullName: string;
  displayName?: string;
  email: string;
  details?: string;
  active?: boolean;
  location?: string;
  createdByEmail: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDraftDto {
  fullName: string;
  displayName?: string;
  email: string;
  details?: string;
  active?: boolean;
  location?: string;
}

export interface UpdateDraftDto extends Partial<CreateDraftDto> {}

@Injectable({ providedIn: 'root' })
export class DraftsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/drafts';

  getAllDrafts(): Observable<Draft[]> {
    return this.http.get<Draft[]>(this.baseUrl);
  }

  getDraftById(id: number): Observable<Draft> {
    return this.http.get<Draft>(`${this.baseUrl}/${id}`);
  }

  createDraft(payload: CreateDraftDto): Observable<Draft> {
    return this.http.post<Draft>(this.baseUrl, payload);
  }

  updateDraft(id: number, payload: UpdateDraftDto): Observable<Draft> {
    return this.http.put<Draft>(`${this.baseUrl}/${id}`, payload);
  }
  deleteDraft(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
