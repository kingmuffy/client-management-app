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
  it('edit mode: constructor pre-fills form with client data', () => {
    const client = baseClient({ fullName: 'Old Name', email: 'old@x.com' });
    const { comp } = setup({ mode: 'edit', client });

    expect(comp.form.get('fullName')!.value).toBe('Old Name');
    expect(comp.form.get('email')!.value).toBe('old@x.com');
  });

  it('edit mode: save -> success calls update, shows snackbar and closes with updated', () => {
    const client = baseClient({ id: 7, fullName: 'Old', email: 'old@x.com' });
    const { comp, clients, snack, dialogRef } = setup({ mode: 'edit', client });

    comp.form.patchValue({ fullName: 'Newer Name' });

    const updated = { ...client, fullName: 'Newer Name' } as Client;
    clients.updateClient.and.returnValue(of(updated));

    comp.save();

    expect(clients.updateClient).toHaveBeenCalledWith(
      7,
      jasmine.objectContaining({
        fullName: 'Newer Name',
      })
    );
    expect(snack.open).toHaveBeenCalledWith(
      'Client updated successfully',
      'Close',
      { duration: 2500 }
    );
    expect(dialogRef.close).toHaveBeenCalledWith(updated);
  });

  it('edit mode: save -> error shows error snackbar and leaves isSaving=false', () => {
    const client = baseClient({ id: 8, fullName: 'X', email: 'x@x.com' });
    const { comp, clients, snack, dialogRef } = setup({ mode: 'edit', client });

    comp.form.patchValue({ fullName: 'Y' });
    clients.updateClient.and.returnValue(throwError(() => new Error('boom')));

    comp.save();

    expect(clients.updateClient).toHaveBeenCalledWith(8, jasmine.any(Object));
    expect(snack.open).toHaveBeenCalledWith(
      'Failed to update client',
      'Close',
      { duration: 3000 }
    );
    expect((comp as any).isSaving).toBeFalse();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('saveAsDraft: invalid fullName/email -> marks as touched and snacks', () => {
    const { comp, drafts, snack, dialogRef } = setup({ mode: 'add' });

    comp.form.patchValue({ fullName: '', email: 'bad', active: true });

    comp.saveAsDraft();

    expect(snack.open).toHaveBeenCalledWith(
      'Enter full name and a valid email to save a draft.',
      'Close',
      { duration: 2500 }
    );
    expect(drafts.createDraft).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('saveAsDraft: success -> shows snackbar and closes with { draft }', () => {
    const { comp, drafts, snack, dialogRef } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: 'Drafty',
      displayName: 'Dr',
      email: 'd@x.com',
      location: '',
      details: '',
      active: true,
    });

    const draftResp = { id: 123, fullName: 'Drafty', email: 'd@x.com' };
    drafts.createDraft.and.returnValue(of(draftResp as any));

    comp.saveAsDraft();

    expect(drafts.createDraft).toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith(
      'Draft saved successfully',
      'Close',
      { duration: 2500 }
    );
    expect(dialogRef.close).toHaveBeenCalledWith({ draft: draftResp });
    expect((comp as any).isDrafting).toBeFalse();
  });

  it('saveAsDraft: error -> shows error snackbar; stays open', () => {
    const { comp, drafts, snack, dialogRef } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: 'Drafty',
      displayName: '',
      email: 'd@x.com',
      location: '',
      details: '',
      active: true,
    });

    drafts.createDraft.and.returnValue(throwError(() => new Error('nope')));

    spyOn(console, 'error');
    comp.saveAsDraft();

    expect(drafts.createDraft).toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith('Failed to save draft', 'Close', {
      duration: 3000,
    });
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect((comp as any).isDrafting).toBeFalse();
  });

  it('save: ignores second call while isSaving=true', () => {
    const { comp, clients } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: 'One',
      displayName: '',
      email: 'one@x.com',
      location: '',
      details: '',
      active: true,
    });

    (comp as any).isSaving = true;
    comp.save();
    expect(clients.addClient).not.toHaveBeenCalled();
  });

  it('saveAsDraft: ignores second call while isDrafting=true', () => {
    const { comp, drafts } = setup({ mode: 'add' });

    comp.form.setValue({
      fullName: 'One',
      displayName: '',
      email: 'one@x.com',
      location: '',
      details: '',
      active: true,
    });

    (comp as any).isDrafting = true;
    comp.saveAsDraft();
    expect(drafts.createDraft).not.toHaveBeenCalled();
  });
});
