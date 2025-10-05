import { TestBed } from '@angular/core/testing';
import { ClientsToolbarComponent } from './clients-toolbar.component';

describe('ClientsToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsToolbarComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ClientsToolbarComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('should expose canManage input (defaults to false)', () => {
    const fixture = TestBed.createComponent(ClientsToolbarComponent);
    const comp = fixture.componentInstance;

    expect(comp.canManage).toBeFalse();

    comp.canManage = true;
    fixture.detectChanges();
    expect(comp.canManage).toBeTrue();
  });

  it('should emit createClient when triggered', (done) => {
    const fixture = TestBed.createComponent(ClientsToolbarComponent);
    const comp = fixture.componentInstance;

    comp.createClient.subscribe(() => {
      done();
    });

    comp.createClient.emit();
  });

  it('should emit uploadFile with the provided type', (done) => {
    const fixture = TestBed.createComponent(ClientsToolbarComponent);
    const comp = fixture.componentInstance;

    const expected = 'excel';
    comp.uploadFile.subscribe((val) => {
      expect(val).toBe(expected);
      done();
    });

    comp.uploadFile.emit(expected);
  });

  it('should emit exportFile with the provided type', (done) => {
    const fixture = TestBed.createComponent(ClientsToolbarComponent);
    const comp = fixture.componentInstance;

    const expected = 'csv';
    comp.exportFile.subscribe((val) => {
      expect(val).toBe(expected);
      done();
    });

    comp.exportFile.emit(expected);
  });
});
