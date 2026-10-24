import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ImportStateService, AnalysisResult } from '../../../core/services/import-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="import-page">
      <h1>Import Dati</h1>
      <div class="import-options">
        <div class="import-card">
          <h2>Import da Excel</h2>
          <p>Carica un file Excel (.xlsx) per importare clienti e/o schede di sicurezza</p>
          <div class="drop-zone" (click)="triggerExcelUpload()" (dragover)="onDragOver($event)" (drop)="onDropExcel($event)">
            <p *ngIf="!excelFile">Trascina qui il file Excel oppure</p>
            <p *ngIf="excelFile" class="file-name">{{ excelFile.name }}</p>
            <button class="btn btn-primary" (click)="triggerExcelUpload($event)">Scegli File</button>
            <input type="file" hidden #excelFileInput accept=".xlsx,.xls" (change)="onExcelFileSelected($event)" />
          </div>
          <div class="import-actions" *ngIf="excelFile">
            <button class="btn btn-success" (click)="importExcel()" [disabled]="isImporting">
              {{ isImporting ? 'Importazione in corso...' : 'Importa' }}
            </button>
            <button class="btn btn-secondary" (click)="cancelExcel()">Annulla</button>
          </div>
        </div>
        <div class="import-card">
          <h2>Analisi PDF con LLM</h2>
          <p>Carica una o più schede di sicurezza in PDF per l'analisi automatica</p>
          <div class="drop-zone" (click)="triggerPdfUpload()" (dragover)="onDragOver($event)" (drop)="onDropPdf($event)">
            <p *ngIf="!pdfFiles.length">Trascina qui i file PDF oppure</p>
            <div *ngIf="pdfFiles.length" class="file-list">
              <div class="file-item" *ngFor="let f of pdfFiles; let i = index">
                <span class="file-name">{{ f.name }}</span>
                <button class="btn-remove" (click)="removePdf(i, $event)" title="Rimuovi">&times;</button>
              </div>
            </div>
            <button class="btn btn-secondary" (click)="triggerPdfUpload($event)">Scegli File</button>
            <input type="file" hidden id="pdfFileInput" accept=".pdf" multiple (change)="onPdfFileSelected($event)" />
          </div>
          <div class="import-actions" *ngIf="pdfFiles.length">
            <div class="form-group">
              <label for="clientId">Cliente *</label>
              <select id="clientId" class="form-control" (change)="onClientChange($event)">
                <option value="">Seleziona cliente</option>
                <option *ngFor="let client of clients" [value]="client.id">{{ client.ragioneSociale }}</option>
              </select>
            </div>
            <button class="btn btn-success" (click)="analyzePdfs()" [disabled]="isAnalyzing || !selectedClientId">
              <span *ngIf="isAnalyzing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isAnalyzing ? 'Analisi in corso... (' + analyzedCount + '/' + pdfFiles.length + ')' : 'Analizza ' + pdfFiles.length + ' file' }}
            </button>
            <button class="btn btn-secondary" (click)="cancelPdf()">Annulla</button>
          </div>
          <div class="analysis-results" *ngIf="analysisResults.length">
            <div class="result-item" *ngFor="let r of analysisResults" [ngClass]="r.success ? 'result-ok' : 'result-fail'">
              <strong>{{ r.fileName }}:</strong> {{ r.message }}
            </div>
          </div>
        </div>
      </div>
      <div class="message" *ngIf="message" [ngClass]="messageType">{{ message }}</div>
    </div>
  `,
  styles: [`
    .import-page { padding: 20px; }
    .import-page h1 { margin-bottom: 24px; color: #2c3e50; }
    .import-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }
    .import-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .import-card h2 { margin-top: 0; color: #2c3e50; }
    .import-card > p { color: #7f8c8d; }
    .drop-zone {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      margin-top: 16px;
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .drop-zone:hover {
      border-color: #3498db;
      background-color: #f8f9fa;
    }
    .drop-zone p { margin-bottom: 12px; color: #999; }
    .file-name {
      color: #3498db;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .import-actions {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-group {
      margin-bottom: 8px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: white;
    }
    .btn-primary { background: #3498db; }
    .btn-primary:hover { background: #2980b9; }
    .btn-secondary { background: #95a5a6; }
    .btn-secondary:hover { background: #7f8c8d; }
    .btn-success { background: #27ae60; }
    .btn-success:hover { background: #219a52; }
    .btn:disabled { background: #bdc3c7; cursor: not-allowed; }
    .message {
      margin-top: 24px;
      padding: 16px;
      border-radius: 4px;
      font-weight: 600;
    }
    .message.success {
      background: #d4edda;
      color: #155724;
    }
    .message.error {
      background: #f8d7da;
      color: #721c24;
    }
    .file-list {
      margin-bottom: 12px;
      text-align: left;
      max-height: 160px;
      overflow-y: auto;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .file-item .file-name {
      margin-bottom: 0;
      font-size: 13px;
    }
    .btn-remove {
      background: none;
      border: none;
      color: #e74c3c;
      font-size: 18px;
      cursor: pointer;
      padding: 0 6px;
      line-height: 1;
    }
    .btn-remove:hover { color: #c0392b; }
    .analysis-results {
      margin-top: 16px;
    }
    .result-item {
      padding: 10px 14px;
      border-radius: 4px;
      margin-bottom: 6px;
      font-size: 14px;
    }
    .result-ok {
      background: #d4edda;
      color: #155724;
    }
    .result-fail {
      background: #f8d7da;
      color: #721c24;
    }
  `]
})
export class ImportComponent implements OnInit, OnDestroy {
  excelFile: File | null = null;
  pdfFiles: File[] = [];
  isImporting = false;
  isAnalyzing = false;
  analyzedCount = 0;
  analysisResults: AnalysisResult[] = [];
  message = '';
  messageType = '';
  clients: any[] = [];
  selectedClientId = 0;

  private stateSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private importState: ImportStateService
  ) {}

  ngOnInit() {
    this.loadClients();
    // Ripristina lo stato salvato
    this.stateSub = this.importState.state$.subscribe(state => {
      this.selectedClientId = state.selectedClientId;
      this.analysisResults = state.analysisResults;
      this.message = state.message;
      this.messageType = state.messageType;
    });
  }

  ngOnDestroy() {
    this.stateSub?.unsubscribe();
  }

  private loadClients() {
    this.apiService.get<any[]>('/clients').subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: () => console.error('Errore caricamento clienti')
    });
  }

  triggerExcelUpload(event?: Event) {
    if (event) event.stopPropagation();
    const input = document.querySelector('#excelFileInput') as HTMLInputElement;
    if (input) input.click();
  }

  triggerPdfUpload(event?: Event) {
    if (event) event.stopPropagation();
    const input = document.querySelector('#pdfFileInput') as HTMLInputElement;
    if (input) input.click();
  }

  onExcelFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.excelFile = input.files[0];
    }
  }

  onPdfFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const newFiles = Array.from(input.files).filter(f => f.name.endsWith('.pdf'));
      this.pdfFiles = [...this.pdfFiles, ...newFiles];
      input.value = '';
    }
  }

  removePdf(index: number, event: Event) {
    event.stopPropagation();
    this.pdfFiles.splice(index, 1);
  }

  onDragOver(event: Event) {
    event.preventDefault();
  }

  onDropExcel(event: Event) {
    event.preventDefault();
    const dataTransfer = event as DragEvent;
    if (dataTransfer.dataTransfer?.files && dataTransfer.dataTransfer.files[0]) {
      this.excelFile = dataTransfer.dataTransfer.files[0];
    }
  }

  onDropPdf(event: Event) {
    event.preventDefault();
    const dataTransfer = event as DragEvent;
    if (dataTransfer.dataTransfer?.files && dataTransfer.dataTransfer.files.length) {
      const newFiles = Array.from(dataTransfer.dataTransfer.files).filter(f => f.name.endsWith('.pdf'));
      this.pdfFiles = [...this.pdfFiles, ...newFiles];
    }
  }

  onClientChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedClientId = parseInt(target.value);
    this.importState.setSelectedClientId(this.selectedClientId);
  }

  cancelExcel() {
    this.excelFile = null;
    const input = document.querySelector('#excelFileInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  cancelPdf() {
    this.pdfFiles = [];
    this.selectedClientId = 0;
    this.analysisResults = [];
    this.analyzedCount = 0;
    this.importState.clear();
    const input = document.querySelector('#pdfFileInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  importExcel() {
    if (!this.excelFile) return;

    this.isImporting = true;
    this.message = '';

    const formData = new FormData();
    formData.append('file', this.excelFile);

    this.apiService.uploadFile<any>('/import/excel', formData).subscribe({
      next: (response) => {
        this.isImporting = false;
        this.message = 'Importazione completata con successo!';
        this.messageType = 'success';
        this.cancelExcel();
        setTimeout(() => this.message = '', 5000);
      },
      error: (error) => {
        this.isImporting = false;
        this.message = 'Errore nell\'importazione: ' + (error.error?.message || error.message);
        this.messageType = 'error';
      }
    });
  }

  analyzePdfs() {
    if (!this.pdfFiles.length || !this.selectedClientId) return;

    this.isAnalyzing = true;
    this.message = '';
    this.analyzedCount = 0;
    this.analysisResults = [];

    const files = [...this.pdfFiles];

    const analyzeNext = (index: number) => {
      if (index >= files.length) {
        this.isAnalyzing = false;
        const ok = this.analysisResults.filter(r => r.success).length;
        this.message = `Analisi completata: ${ok}/${files.length} file elaborati con successo.`;
        this.messageType = ok === files.length ? 'success' : 'error';
        return;
      }

      const file = files[index];
      const formData = new FormData();
      formData.append('clientId', this.selectedClientId.toString());
      formData.append('pdfFile', file);

      this.apiService.uploadFile<any>('/safety-cards/analyze-pdf', formData).subscribe({
        next: (response) => {
          this.analyzedCount = index + 1;
          const result: AnalysisResult = {
            fileName: file.name,
            success: true,
            message: response.message || 'Prodotto creato con successo'
          };
          this.analysisResults.push(result);
          this.importState.addAnalysisResult(result);
          analyzeNext(index + 1);
        },
        error: (error) => {
          this.analyzedCount = index + 1;
          const result: AnalysisResult = {
            fileName: file.name,
            success: false,
            message: error.error?.message || error.message || 'Errore durante l\'analisi'
          };
          this.analysisResults.push(result);
          this.importState.addAnalysisResult(result);
          analyzeNext(index + 1);
        }
      });
    };

    analyzeNext(0);
  }
}
