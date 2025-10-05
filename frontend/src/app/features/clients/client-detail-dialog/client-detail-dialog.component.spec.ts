import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClientDetailDialogComponent } from './client-detail-dialog.component';
import { ClientsService, Client } from '../clients.service';
import { AuthService } from '../../../core/auth/auth.service';

class ClientsSvcMock {
  getClient = jasmine.createSpy('getClient').and.returnValue(of());
  deleteClient = jasmine.createSpy('deleteClient').and.returnValue(of(void 0));
}

class SnackMock {
  open = jasmine.createSpy('open');
}

class AuthMock {
  isAdminOrEditor = jasmine.createSpy('isAdminOrEditor').and.returnValue(true);
}

function makeDialogRefSpy() {
  return jasmine.createSpyObj<MatDialogRef<ClientDetailDialogComponent>>(
    'MatDialogRef',
    ['close']
  );
}

function makeDialogMock() {
  return { open: jasmine.createSpy('open') } as unknown as MatDialog;
}

function setup(data: any) {
  const dialogRefSpy = makeDialogRefSpy();
  const dialogMock = makeDialogMock();

  TestBed.configureTestingModule({
    imports: [ClientDetailDialogComponent],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: ClientsService, useClass: ClientsSvcMock },
      { provide: MatDialogRef, useValue: dialogRefSpy },
      { provide: MatDialog, useValue: dialogMock },
      { provide: MatSnackBar, useClass: SnackMock },
      { provide: AuthService, useClass: AuthMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ClientDetailDialogComponent);
  const comp = fixture.componentInstance;

  (comp as any).dialog = TestBed.inject(MatDialog) as any;
  (comp as any).snack = TestBed.inject(MatSnackBar) as any;

  const svc = TestBed.inject(ClientsService) as unknown as ClientsSvcMock;
  const snack = TestBed.inject(MatSnackBar) as unknown as SnackMock;
  const auth = TestBed.inject(AuthService) as unknown as AuthMock;
  const dlg = TestBed.inject(MatDialog) as MatDialog;
  const dlgRef = TestBed.inject(
    MatDialogRef
  ) as MatDialogRef<ClientDetailDialogComponent>;

  //  detect changes not called here
  return { fixture, comp, svc, snack, auth, dlg, dlgRef };
}

describe('ClientDetailDialogComponent', () => {
  const baseClient = (p: Partial<Client> = {}): Client =>
    ({
      id: 1,
      fullName: 'John Doe',
      email: 'john@doe.com',
      active: true,
      displayName: '',
      details: '',
      location: '',
      ...p,
    } as Client);

  it('loads by id on init (success)', () => {
    const client = baseClient({ id: 5, fullName: 'Alice' });
    const { comp, svc, fixture } = setup({ id: 5 });

    svc.getClient.and.returnValue(of(client));

    fixture.detectChanges();

    expect(svc.getClient).toHaveBeenCalledWith(5);
    expect(comp.loading()).toBeFalse();
    expect(comp.error()).toBeNull();
    expect(comp.client()).toEqual(client);
  });

  it('loads by id on init (error -> sets error & clears loading)', () => {
    const { comp, svc, fixture } = setup({ id: 9 });

    svc.getClient.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(comp.loading()).toBeFalse();
    expect(comp.error()).toBe('Failed to load client details.');
    expect(comp.client()).toBeNull();
  });

  it('when opened with full client: shows immediately, silent refresh error does not set error', () => {
    const incoming = baseClient({ id: 7, fullName: 'Bob' });
    const { comp, svc, fixture } = setup({ client: incoming });

    svc.getClient.and.returnValue(throwError(() => new Error('silent')));

    fixture.detectChanges();

    expect(comp.loading()).toBeFalse();
    expect(comp.client()).toEqual(incoming);
    expect(comp.error()).toBeNull();
  });
  it('editClient: opens form, updates client, shows snackbar and closes with payload', () => {
    const updated = baseClient({ id: 3, fullName: 'Updated' });
    const original = baseClient({ id: 3, fullName: 'Old' });

    const { comp, snack, dlg, dlgRef, fixture } = setup({ client: original });

    comp.client.set(original);

    (dlg.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(updated),
    });

    fixture.detectChanges();

    comp.editClient();

    expect(dlg.open).toHaveBeenCalled();
    expect(comp.client()).toEqual(updated);
    expect(snack.open).toHaveBeenCalledWith('Client updated', 'Close', {
      duration: 2500,
    });
    expect(dlgRef.close).toHaveBeenCalledWith({
      edited: true,
      client: updated,
    });
  });

  it('deleteClient: confirm -> success calls service, shows snackbar and closes', () => {
    const current = baseClient({ id: 11, fullName: 'To Del' });
    const { comp, svc, snack, dlg, dlgRef, fixture } = setup({
      client: current,
    });

    comp.client.set(current);

    (dlg.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(true),
    });
    svc.deleteClient.and.returnValue(of(void 0));

    fixture.detectChanges();

    comp.deleteClient();

    expect(dlg.open).toHaveBeenCalled();
    expect(svc.deleteClient).toHaveBeenCalledWith(11);
    expect(snack.open).toHaveBeenCalledWith(
      'Client deleted successfully',
      'Close',
      { duration: 3000 }
    );
    expect(dlgRef.close).toHaveBeenCalledWith({ deleted: true });
  });

  it('deleteClient: confirm -> error shows failure snackbar (no close)', () => {
    const current = baseClient({ id: 12, fullName: 'Err' });
    const { comp, svc, snack, dlg, dlgRef, fixture } = setup({
      client: current,
    });

    comp.client.set(current);

    (dlg.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(true),
    });
    svc.deleteClient.and.returnValue(throwError(() => new Error('nope')));

    fixture.detectChanges();

    comp.deleteClient();

    expect(dlg.open).toHaveBeenCalled();
    expect(svc.deleteClient).toHaveBeenCalledWith(12);
    expect(snack.open).toHaveBeenCalledWith(
      'Failed to delete client',
      'Close',
      {
        duration: 3000,
      }
    );
    expect(dlgRef.close).not.toHaveBeenCalledWith({ deleted: true });
  });

  it('deleteClient: cancel confirm -> does nothing', () => {
    const current = baseClient({ id: 2, fullName: 'Cancel' });
    const { comp, svc, snack, dlg, dlgRef, fixture } = setup({
      client: current,
    });

    comp.client.set(current);

    (dlg.open as jasmine.Spy).and.returnValue({
      afterClosed: () => of(false),
    });

    fixture.detectChanges();

    comp.deleteClient();

    expect(dlg.open).toHaveBeenCalled();
    expect(svc.deleteClient).not.toHaveBeenCalled();
    expect(snack.open).not.toHaveBeenCalled();
    expect(dlgRef.close).not.toHaveBeenCalled();
  });
});
