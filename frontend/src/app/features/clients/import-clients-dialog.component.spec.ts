import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

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
});
