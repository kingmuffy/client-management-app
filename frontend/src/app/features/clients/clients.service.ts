import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
}
export type CreateClientDto = {
  fullName: string;
  displayName?: string | null;
  email: string;
  details?: string | null;
  active?: boolean | null;
  location?: string | null;
};

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly API_URL = '/api/clients';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.API_URL);
  }

  getClientCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/${id}`);
  }

  addClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.API_URL, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
  importClientsBulk(rows: CreateClientDto[]): Observable<Client[]> {
    return this.http.post<Client[]>(`${this.API_URL}/bulk`, rows);
  }
}
