import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientsComponent } from './clients.component';
import { ClientsService, Client } from './clients.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import * as XLSX from 'xlsx';

class SvcMock {
  getClients = jasmine.createSpy().and.returnValue(of([]));
  getClientCount = jasmine.createSpy().and.returnValue(of(0));
  deleteClient = jasmine.createSpy().and.returnValue(of(void 0));
}
class SnackMock {
  open = jasmine.createSpy('open');
}
class AuthMock {
  isAdminOrEditor = jasmine.createSpy().and.returnValue(true);
}
const dlgMock = () => ({
  open: jasmine
    .createSpy('open')
    .and.returnValue({ afterClosed: () => of(void 0) }),
});
const make = (id: number, p: Partial<Client> = {}) =>
  ({
    id,
    fullName: `N${id}`,
    displayName: `D${id}`,
    email: `u${id}@x.com`,
    location: id % 2 ? 'AMS' : 'RTM',
    details: '',
    active: id % 2 === 0,
    ...p,
  } as Client);

describe('ClientsComponent (compact)', () => {
  let c: ClientsComponent,
    svc: SvcMock,
    dlg: ReturnType<typeof dlgMock>,
    snack: SnackMock,
    auth: AuthMock;

  beforeEach(async () => {
    dlg = dlgMock();
    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        { provide: ClientsService, useClass: SvcMock },
        { provide: MatDialog, useValue: dlg },
        { provide: MatSnackBar, useClass: SnackMock },
        { provide: AuthService, useClass: AuthMock },
      ],
    }).compileComponents();
    const f = TestBed.createComponent(ClientsComponent);
    c = f.componentInstance;
    (c as any).dialog = dlg;
    svc = TestBed.inject(ClientsService) as any;
    snack = TestBed.inject(MatSnackBar) as any;
    (c as any).snack = snack;
    auth = TestBed.inject(AuthService) as any;
    spyOn(c, 'loadClients').and.stub();
  });

  it('ngOnInit calls load & count', () => {
    (c.loadClients as any).and.callThrough();
    svc.getClientCount.and.returnValue(of(7));
    c.ngOnInit();
    expect(c.loadClients).toHaveBeenCalled();
    expect(c.clientCount()).toBe(7);
  });

  it('loadClients success & error', () => {
    (c.loadClients as any).and.callThrough();
    const list = [make(1), make(2)];
    svc.getClients.and.returnValue(of(list));
    c.loadClients();
    expect(c.loading()).toBeFalse();
    expect(c.clients()).toEqual(list);
    const al = spyOn(window, 'alert');
    svc.getClients.and.returnValue(throwError(() => new Error()));
    c.loadClients();
    expect(c.loading()).toBeFalse();
    expect(al).toHaveBeenCalledWith('Failed to load clients');
  });

  it('filter/sort/page & trackBy', () => {
    c.clients.set([
      make(1, { fullName: 'C' }),
      make(2, { fullName: 'A' }),
      make(3, { fullName: 'B' }),
    ]);
    c.pageSize.set(10);
    c.onSortChange({ active: 'fullName', direction: 'asc' } as any);
    expect(c.filteredClients().map((x) => x.fullName)).toEqual(['A', 'B', 'C']);
    c.pageSize.set(2);
    c.pageIndex.set(1);
    // corrected: second page of [2,3,1]
    expect(c.filteredClients().map((x) => x.id)).toEqual([1]);
    expect(c.trackById(0, make(42))).toBe(42);
  });

  it('detail/edit/add/delete/upload flows', () => {
    (c.loadClients as any).and.stub();
    dlg.open.and.returnValue({
      afterClosed: () => of({ edited: true }),
    } as any);
    c.openDetail(make(1));
    expect(c.loadClients).toHaveBeenCalled();
    dlg.open.and.returnValue({
      afterClosed: () => of({ deleted: true }),
    } as any);
    c.openDetail(make(2));
    expect(c.loadClients).toHaveBeenCalled();

    auth.isAdminOrEditor.and.returnValue(true);
    c.clients.set([make(1, { fullName: 'Old' }), make(2)]);
    dlg.open.and.returnValue({
      afterClosed: () => of(make(1, { fullName: 'New' })),
    } as any);
    c.editClient(c.clients()[0]);
    expect(c.clients()[0].fullName).toBe('New');
    expect(snack.open).toHaveBeenCalledWith('Client updated', 'Close', {
      duration: 2500,
    });

    dlg.open.and.returnValue({ afterClosed: () => of(make(3)) } as any);
    c.clientCount.set(1);
    c.openAddClient();
    expect(c.clients().length).toBe(3);
    expect(c.clientCount()).toBe(2);
    expect(snack.open).toHaveBeenCalledWith('Client created', 'Close', {
      duration: 2500,
    });

    dlg.open.and.returnValue({ afterClosed: () => of(true) } as any);
    svc.deleteClient.and.returnValue(of(void 0));
    c.deleteClient(c.clients()[0]);
    expect(snack.open).toHaveBeenCalledWith('Client deleted', 'Close', {
      duration: 2500,
    });

    dlg.open.and.returnValue({ afterClosed: () => of(true) } as any);
    svc.deleteClient.and.returnValue(throwError(() => new Error()));
    const len = c.clients().length;
    c.deleteClient(c.clients()[0]);
    expect(c.clients().length).toBe(len);
    expect(snack.open).toHaveBeenCalledWith(
      'Failed to delete client',
      'Close',
      { duration: 3000 }
    );

    (c.loadClients as any).and.stub();
    dlg.open.and.returnValue({ afterClosed: () => of({ count: 5 }) } as any);
    c.handleUpload('excel');
    expect(snack.open).toHaveBeenCalledWith('Imported 5 client(s)', 'Close', {
      duration: 3000,
    });
    expect(c.loadClients).toHaveBeenCalled();
  });

  it('export csv/excel & no data', () => {
    const toSheet = spyOn(XLSX.utils, 'json_to_sheet').and.callFake(
      () => ({} as any)
    );
    const newWb = spyOn(XLSX.utils, 'book_new').and.callFake(
      () => ({ SheetNames: [], Sheets: {} } as any)
    );
    spyOn(XLSX.utils, 'book_append_sheet').and.callFake(
      (wb: any, ws: any, n: string) => {
        wb.SheetNames.push(n);
        wb.Sheets[n] = ws;
      }
    );
    c.clients.set([]);
    c.handleExport('csv');
    expect(snack.open).toHaveBeenCalledWith('No clients to export', 'Close', {
      duration: 2500,
    });
    c.clients.set([make(1), make(2)]);
    c.handleExport('excel');
    expect(toSheet).toHaveBeenCalled();
    expect(newWb).toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith(
      'Exported 2 client(s) as EXCEL',
      'Close',
      { duration: 3000 }
    );
  });
});
