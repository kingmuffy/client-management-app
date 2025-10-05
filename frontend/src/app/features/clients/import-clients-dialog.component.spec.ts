import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { ImportClientsDialogComponent } from './import-clients-dialog.component';
import { ClientsService, Client } from './clients.service';
import * as XLSX from 'xlsx';

class ClientsServiceMock {
  importClientsBulk = jasmine.createSpy().and.returnValue(of([]));
}

describe('ImportClientsDialogComponent', () => {
  let fixture: ComponentFixture<ImportClientsDialogComponent>;
  let comp: ImportClientsDialogComponent;

  let svc: ClientsServiceMock;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ImportClientsDialogComponent>>;
  let snack: MatSnackBar;

  const origFileReader = (window as any).FileReader;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ImportClientsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: ClientsService, useClass: ClientsServiceMock },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportClientsDialogComponent);
    comp = fixture.componentInstance;

    svc = TestBed.inject(ClientsService) as any;
    snack = TestBed.inject(MatSnackBar);
    spyOn(snack, 'open').and.stub();

    fixture.detectChanges();
  });

  afterEach(() => {
    (window as any).FileReader = origFileReader;
  });

  function makeWorkbookBuffer(rows: any[][]): ArrayBuffer {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'S1');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  }

  function stubFileReaderWith(buffer: ArrayBuffer) {
    class FakeFR {
      result: ArrayBuffer | null = null;
      onload: ((ev: ProgressEvent<FileReader>) => any) | null = null;

      readAsArrayBuffer(_file: File) {
        this.result = buffer;
        Promise.resolve().then(() => {
          if (typeof this.onload === 'function') {
            this.onload({} as ProgressEvent<FileReader>);
          }
        });
      }
    }
    (window as any).FileReader = FakeFR as any;
  }

  it('onFileSelected: parses sheet and populates validRows/errors; clears loading', async () => {
    const buf = makeWorkbookBuffer([
      ['fullName', 'displayName', 'email', 'location', 'details', 'active'],
      ['John Doe', 'JD', 'john@x.com', 'AMS', '', 'true'],
      ['No Email', '', '', '', '', 'false'],
    ]);
    stubFileReaderWith(buf);

    const file = new File(['dummy'], 'clients.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    comp.onFileSelected({ target: input } as any);
    await fixture.whenStable();

    expect(comp.loading()).toBeFalse();

    const valids = comp.validRows();
    const errs = comp.errors();

    expect(valids.length).toBe(1);
    expect(valids[0].fullName).toBe('John Doe');
    expect(valids[0].email).toBe('john@x.com');
    expect(valids[0].location).toBe('AMS');
    expect(valids[0].active).toBe(true);

    expect(errs.length).toBe(1);
    expect(errs[0].issues.join(' ')).toContain('email is required');
  });
  it('onFileSelected: parse error -> shows snackbar and clears loading', async () => {
    const buf = makeWorkbookBuffer([
      ['fullName', 'email'],
      ['A', 'a@x.com'],
    ]);
    stubFileReaderWith(buf);

    const sheetToJsonSpy = spyOn(XLSX.utils, 'sheet_to_json').and.throwError(
      'boom'
    );

    const file = new File(['ok'], 'ok.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    comp.onFileSelected({ target: input } as any);
    await fixture.whenStable();

    expect(sheetToJsonSpy).toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith('Failed to parse file', 'Close', {
      duration: 3000,
    });
    expect(comp.loading()).toBeFalse();
  });

  it('import(): no rows -> does nothing', () => {
    comp.validRows.set([]);
    comp.import();
    expect(svc.importClientsBulk).not.toHaveBeenCalled();
  });

  it('import(): success -> snacks and closes with count; clears loading', () => {
    comp.validRows.set([{ fullName: 'A', email: 'a@x.com' }]);
    const created: Client[] = [
      { id: 1, fullName: 'A', email: 'a@x.com', active: true } as any,
    ];
    (svc.importClientsBulk as jasmine.Spy).and.returnValue(of(created));

    comp.import();

    expect(svc.importClientsBulk).toHaveBeenCalledWith(comp.validRows());
    expect(snack.open).toHaveBeenCalledWith('Imported 1 client(s)', 'Close', {
      duration: 3000,
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ count: 1 });
    expect(comp.loading()).toBeFalse();
  });

  it('import(): error -> snacks error and clears loading (no close)', () => {
    comp.validRows.set([{ fullName: 'B', email: 'b@x.com' }]);
    (svc.importClientsBulk as jasmine.Spy).and.returnValue(
      throwError(() => new Error('nope'))
    );

    comp.import();

    expect(svc.importClientsBulk).toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith(
      'Import failed. Check file and try again.',
      'Close',
      { duration: 4000 }
    );
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(comp.loading()).toBeFalse();
  });

  it('coerceBool (private): converts truthy/falsey strings and returns null otherwise', () => {
    const cb = (comp as any).coerceBool.bind(comp) as (
      v: any
    ) => boolean | null;
    expect(cb(true)).toBeTrue();
    expect(cb(false)).toBeFalse();
    expect(cb('YES')).toBeTrue();
    expect(cb('1')).toBeTrue();
    expect(cb('no')).toBeFalse();
    expect(cb('0')).toBeFalse();
    expect(cb('')).toBeNull();
    expect(cb(undefined)).toBeNull();
    expect(cb('maybe')).toBeNull();
  });

  it('downloadTemplate() builds workbook via utils (no writeFile spy on ESM)', () => {
    const aoaSpy = spyOn(XLSX.utils, 'aoa_to_sheet').and.callThrough();
    const newSpy = spyOn(XLSX.utils, 'book_new').and.callThrough();
    const appendSpy = spyOn(XLSX.utils, 'book_append_sheet').and.callThrough();

    expect(() => comp.downloadTemplate()).not.toThrow();

    expect(aoaSpy).toHaveBeenCalled();
    expect(newSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
  });
});
