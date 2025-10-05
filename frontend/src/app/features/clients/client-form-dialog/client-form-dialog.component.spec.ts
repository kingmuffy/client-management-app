import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClientFormDialogComponent } from './client-form-dialog.component';
import { ClientsService, Client } from '../clients.service';
import { DraftsService } from '../../drafts/drafts.service';

class ClientsSvcMock {
  addClient = jasmine.createSpy('addClient').and.returnValue(of({} as Client));
  updateClient = jasmine
    .createSpy('updateClient')
    .and.returnValue(of({} as Client));
}
class DraftsSvcMock {
  createDraft = jasmine.createSpy('createDraft').and.returnValue(of({}));
}
class SnackMock {
  open = jasmine.createSpy('open');
}
function makeDialogRefSpy() {
  return jasmine.createSpyObj<MatDialogRef<ClientFormDialogComponent>>(
    'MatDialogRef',
    ['close']
  );
}

function setup(data: any) {
  const dialogRefSpy = makeDialogRefSpy();

  TestBed.configureTestingModule({
    imports: [ClientFormDialogComponent],
    providers: [
      { provide: ClientsService, useClass: ClientsSvcMock },
      { provide: DraftsService, useClass: DraftsSvcMock },
      { provide: MatSnackBar, useClass: SnackMock },
      { provide: MatDialogRef, useValue: dialogRefSpy },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ClientFormDialogComponent);
  const comp = fixture.componentInstance;

  (comp as any).snack = TestBed.inject(MatSnackBar);

  const clients = TestBed.inject(ClientsService) as unknown as ClientsSvcMock;
  const drafts = TestBed.inject(DraftsService) as unknown as DraftsSvcMock;
  const snack = TestBed.inject(MatSnackBar) as unknown as SnackMock;
  const dialogRef = TestBed.inject(
    MatDialogRef
  ) as MatDialogRef<ClientFormDialogComponent>;

  return { fixture, comp, clients, drafts, snack, dialogRef };
}

const baseClient = (p: Partial<Client> = {}): Client =>
  ({
    id: 1,
    fullName: 'John Doe',
    displayName: 'JD',
    email: 'john@doe.com',
    details: '',
    active: true,
    location: 'NY',
    ...p,
  } as Client);

describe('ClientFormDialogComponent', () => {
  it('add mode: save -> success shows snackbar and closes with created client', () => {
    const { comp, clients, snack, dialogRef } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: 'Alice',
      displayName: 'Al',
      email: 'alice@x.com',
      location: 'AMS',
      details: 'note',
      active: true,
    });

    const created = baseClient({
      id: 99,
      fullName: 'Alice',
      email: 'alice@x.com',
    });
    clients.addClient.and.returnValue(of(created));

    comp.save();

    expect(clients.addClient).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fullName: 'Alice',
        email: 'alice@x.com',
      })
    );
    expect(snack.open).toHaveBeenCalledWith(
      'Client created successfully',
      'Close',
      { duration: 2500 }
    );
    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('add mode: save -> error shows error snackbar and leaves isSaving=false', () => {
    const { comp, clients, snack, dialogRef } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: 'Alice',
      displayName: '',
      email: 'alice@x.com',
      location: '',
      details: '',
      active: true,
    });

    clients.addClient.and.returnValue(throwError(() => new Error('fail')));

    comp.save();

    expect(clients.addClient).toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith(
      'Failed to create client',
      'Close',
      { duration: 3000 }
    );
    expect((comp as any).isSaving).toBeFalse();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('add mode: save does nothing when form invalid', () => {
    const { comp, clients, snack, dialogRef } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: '',
      displayName: '',
      email: 'bad-email',
      location: '',
      details: '',
      active: true,
    });

    comp.save();

    expect(clients.addClient).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
