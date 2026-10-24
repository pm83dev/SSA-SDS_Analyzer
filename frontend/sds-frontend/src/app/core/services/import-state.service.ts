import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AnalysisResult {
  fileName: string;
  success: boolean;
  message: string;
}

interface ImportState {
  pdfFileNames: string[];
  selectedClientId: number;
  analysisResults: AnalysisResult[];
  message: string;
  messageType: 'success' | 'error' | '';
}

const STORAGE_KEY = 'sds-import-state';

@Injectable({
  providedIn: 'root'
})
export class ImportStateService {
  private state: ImportState = {
    pdfFileNames: [],
    selectedClientId: 0,
    analysisResults: [],
    message: '',
    messageType: ''
  };

  // BehaviorSubject per notificare i cambiamenti
  private stateSubject = new BehaviorSubject<ImportState>(this.loadState());
  state$: Observable<ImportState> = this.stateSubject.asObservable();

  get current(): ImportState {
    return this.state;
  }

  setPdfFileNames(names: string[]) {
    this.state.pdfFileNames = names;
    this.saveState();
  }

  setSelectedClientId(id: number) {
    this.state.selectedClientId = id;
    this.saveState();
  }

  addAnalysisResult(result: AnalysisResult) {
    this.state.analysisResults.push(result);
    this.saveState();
  }

  setMessage(message: string, type: 'success' | 'error' | '') {
    this.state.message = message;
    this.state.messageType = type;
    this.saveState();
  }

  clear() {
    this.state = {
      pdfFileNames: [],
      selectedClientId: 0,
      analysisResults: [],
      message: '',
      messageType: ''
    };
    this.saveState();
  }

  private saveState() {
    this.stateSubject.next(this.state);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Non è stato possibile salvare lo stato in sessionStorage', e);
    }
  }

  private loadState(): ImportState {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...this.state, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Non è stato possibile caricare lo stato da sessionStorage', e);
    }
    return this.state;
  }
}