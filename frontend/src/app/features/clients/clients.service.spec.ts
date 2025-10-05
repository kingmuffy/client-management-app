import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ClientsService, Client, CreateClientDto } from './clients.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientsService],
      schemas: [NO_ERRORS_SCHEMA],
    });

    service = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const mockClient: Client = {
    id: 1,
    fullName: 'John Doe',
    displayName: 'JD',
    email: 'john@example.com',
    details: 'Sample client',
    active: true,
    location: 'NY',
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch clients list', () => {
    service.getClients().subscribe((clients) => {
      expect(clients.length).toBe(1);
      expect(clients[0].fullName).toBe('John Doe');
    });

    const req = httpMock.expectOne('/api/clients');
    expect(req.request.method).toBe('GET');
    req.flush([mockClient]);
  });

  it('should get client count', () => {
    service.getClientCount().subscribe((count) => {
      expect(count).toBe(5);
    });

    const req = httpMock.expectOne('/api/clients/count');
    expect(req.request.method).toBe('GET');
    req.flush(5);
  });

  it('should fetch single client by ID', () => {
    service.getClient(1).subscribe((client) => {
      expect(client.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/clients/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockClient);
  });

  it('should add a client', () => {
    const newClient = { fullName: 'Jane Smith', email: 'jane@example.com' };

    service.addClient(newClient).subscribe((client) => {
      expect(client.fullName).toBe('Jane Smith');
    });

    const req = httpMock.expectOne('/api/clients');
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockClient, ...newClient });
  });

  it('should update a client', () => {
    const updated = { fullName: 'John Updated' };

    service.updateClient(1, updated).subscribe((client) => {
      expect(client.fullName).toBe('John Updated');
    });

    const req = httpMock.expectOne('/api/clients/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockClient, ...updated });
  });

  it('should delete a client', () => {
    service.deleteClient(1).subscribe((res) => {
      expect(res).toBeDefined();
    });

    const req = httpMock.expectOne('/api/clients/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should import clients in bulk', () => {
    const bulk: CreateClientDto[] = [
      { fullName: 'Bulk 1', email: 'b1@test.com' },
      { fullName: 'Bulk 2', email: 'b2@test.com' },
    ];

    service.importClientsBulk(bulk).subscribe((clients) => {
      expect(clients.length).toBe(2);
      expect(clients[0].fullName).toBe('Bulk 1');
    });

    const req = httpMock.expectOne('/api/clients/bulk');
    expect(req.request.method).toBe('POST');
    req.flush([
      { ...mockClient, fullName: 'Bulk 1' },
      { ...mockClient, fullName: 'Bulk 2' },
    ]);
  });
});
