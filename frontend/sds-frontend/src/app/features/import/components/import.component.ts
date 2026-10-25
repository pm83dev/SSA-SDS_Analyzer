import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ImportStateService, AnalysisResult } from '../../../core/services/import-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css'
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
    // Vuoto = nessun cliente: la scheda va solo nell'archivio
    this.selectedClientId = target.value ? parseInt(target.value, 10) : 0;
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
        this.message = `Importazione completata: ${response?.cardsImported ?? 0} schede create` + (response?.errors ? `, ${response.errors} righe scartate` : '');
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
    if (!this.pdfFiles.length) return;

    this.isAnalyzing = true;
    this.message = '';
    this.analyzedCount = 0;
    // I risultati vivono nello stato condiviso: la subscription aggiorna analysisResults
    this.importState.clearResults();

    const files = [...this.pdfFiles];

    const analyzeNext = (index: number) => {
      if (index >= files.length) {
        this.isAnalyzing = false;
        const ok = this.analysisResults.filter(r => r.success).length;
        this.message = `Analisi completata: ${ok}/${files.length} file elaborati con successo.`;
        this.messageType = ok === files.length ? 'success' : 'error';
        this.importState.setMessage(this.message, this.messageType as 'success' | 'error');
        return;
      }

      const file = files[index];
      const formData = new FormData();
      if (this.selectedClientId) formData.append('clientId', this.selectedClientId.toString());
      formData.append('pdfFile', file);

      this.apiService.uploadFile<any>('/safety-cards/analyze-pdf', formData).subscribe({
        next: (response) => {
          this.analyzedCount = index + 1;
          const result: AnalysisResult = {
            fileName: file.name,
            success: true,
            message: response.message || 'Scheda creata con successo'
          };
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
          this.importState.addAnalysisResult(result);
          analyzeNext(index + 1);
        }
      });
    };

    analyzeNext(0);
  }
}
