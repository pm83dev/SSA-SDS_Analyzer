import {
  ApiService
} from "./chunk-APIYY3YU.js";
import {
  BehaviorSubject,
  CommonModule,
  NgClass,
  NgForOf,
  NgIf,
  __spreadValues,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-XOMSVR7A.js";

// src/app/core/services/import-state.service.ts
var STORAGE_KEY = "sds-import-state";
var ImportStateService = class _ImportStateService {
  state = {
    pdfFileNames: [],
    selectedClientId: 0,
    analysisResults: [],
    message: "",
    messageType: ""
  };
  // BehaviorSubject per notificare i cambiamenti
  stateSubject = new BehaviorSubject(this.loadState());
  state$ = this.stateSubject.asObservable();
  constructor() {
    this.state = this.stateSubject.value;
  }
  get current() {
    return this.state;
  }
  setPdfFileNames(names) {
    this.state.pdfFileNames = names;
    this.saveState();
  }
  setSelectedClientId(id) {
    this.state.selectedClientId = id;
    this.saveState();
  }
  addAnalysisResult(result) {
    this.state.analysisResults = [...this.state.analysisResults, result];
    this.saveState();
  }
  clearResults() {
    this.state.analysisResults = [];
    this.state.message = "";
    this.state.messageType = "";
    this.saveState();
  }
  setMessage(message, type) {
    this.state.message = message;
    this.state.messageType = type;
    this.saveState();
  }
  clear() {
    this.state = {
      pdfFileNames: [],
      selectedClientId: 0,
      analysisResults: [],
      message: "",
      messageType: ""
    };
    this.saveState();
  }
  saveState() {
    this.stateSubject.next(this.state);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Non \xE8 stato possibile salvare lo stato in sessionStorage", e);
    }
  }
  loadState() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return __spreadValues(__spreadValues({}, this.state), JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Non \xE8 stato possibile caricare lo stato da sessionStorage", e);
    }
    return this.state;
  }
  static \u0275fac = function ImportStateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImportStateService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ImportStateService, factory: _ImportStateService.\u0275fac, providedIn: "root" });
};

// src/app/features/import/components/import.component.ts
function ImportComponent_p_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1, "Trascina qui il file Excel oppure");
    \u0275\u0275elementEnd();
  }
}
function ImportComponent_p_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.excelFile.name);
  }
}
function ImportComponent_div_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 15)(1, "button", 16);
    \u0275\u0275listener("click", function ImportComponent_div_15_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.importExcel());
    });
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 10);
    \u0275\u0275listener("click", function ImportComponent_div_15_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.cancelExcel());
    });
    \u0275\u0275text(4, "Annulla");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r0.isImporting);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.isImporting ? "Importazione in corso..." : "Importa", " ");
  }
}
function ImportComponent_p_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1, "Trascina qui i file PDF oppure");
    \u0275\u0275elementEnd();
  }
}
function ImportComponent_div_23_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 19)(1, "span", 14);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 20);
    \u0275\u0275listener("click", function ImportComponent_div_23_div_1_Template_button_click_3_listener($event) {
      const i_r4 = \u0275\u0275restoreView(_r3).index;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.removePdf(i_r4, $event));
    });
    \u0275\u0275text(4, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const f_r5 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(f_r5.name);
  }
}
function ImportComponent_div_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275template(1, ImportComponent_div_23_div_1_Template, 5, 1, "div", 18);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.pdfFiles);
  }
}
function ImportComponent_div_27_option_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const client_r7 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("value", client_r7.id)("selected", client_r7.id === ctx_r0.selectedClientId);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(client_r7.ragioneSociale);
  }
}
function ImportComponent_div_27_span_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 28);
  }
}
function ImportComponent_div_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 15)(1, "div", 21)(2, "label", 22);
    \u0275\u0275text(3, "Cliente (facoltativo)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "select", 23);
    \u0275\u0275listener("change", function ImportComponent_div_27_Template_select_change_4_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onClientChange($event));
    });
    \u0275\u0275elementStart(5, "option", 24);
    \u0275\u0275text(6, "Nessun cliente (solo archivio)");
    \u0275\u0275elementEnd();
    \u0275\u0275template(7, ImportComponent_div_27_option_7_Template, 2, 3, "option", 25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 16);
    \u0275\u0275listener("click", function ImportComponent_div_27_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.analyzePdfs());
    });
    \u0275\u0275template(9, ImportComponent_div_27_span_9_Template, 1, 0, "span", 26);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 10);
    \u0275\u0275listener("click", function ImportComponent_div_27_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.cancelPdf());
    });
    \u0275\u0275text(12, "Annulla");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275property("ngForOf", ctx_r0.clients);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r0.isAnalyzing);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.isAnalyzing);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.isAnalyzing ? "Analisi in corso... (" + ctx_r0.analyzedCount + "/" + ctx_r0.pdfFiles.length + ")" : "Analizza " + ctx_r0.pdfFiles.length + " file", " ");
  }
}
function ImportComponent_div_28_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 31)(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r8 = ctx.$implicit;
    \u0275\u0275property("ngClass", r_r8.success ? "result-ok" : "result-fail");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", r_r8.fileName, ":");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", r_r8.message, " ");
  }
}
function ImportComponent_div_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 29);
    \u0275\u0275template(1, ImportComponent_div_28_div_1_Template, 4, 3, "div", 30);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.analysisResults);
  }
}
function ImportComponent_div_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("ngClass", ctx_r0.messageType);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.message);
  }
}
var ImportComponent = class _ImportComponent {
  apiService;
  importState;
  excelFile = null;
  pdfFiles = [];
  isImporting = false;
  isAnalyzing = false;
  analyzedCount = 0;
  analysisResults = [];
  message = "";
  messageType = "";
  clients = [];
  selectedClientId = 0;
  stateSub;
  constructor(apiService, importState) {
    this.apiService = apiService;
    this.importState = importState;
  }
  ngOnInit() {
    this.loadClients();
    this.stateSub = this.importState.state$.subscribe((state) => {
      this.selectedClientId = state.selectedClientId;
      this.analysisResults = state.analysisResults;
      this.message = state.message;
      this.messageType = state.messageType;
    });
  }
  ngOnDestroy() {
    this.stateSub?.unsubscribe();
  }
  loadClients() {
    this.apiService.get("/clients").subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: () => console.error("Errore caricamento clienti")
    });
  }
  triggerExcelUpload(event) {
    if (event)
      event.stopPropagation();
    const input = document.querySelector("#excelFileInput");
    if (input)
      input.click();
  }
  triggerPdfUpload(event) {
    if (event)
      event.stopPropagation();
    const input = document.querySelector("#pdfFileInput");
    if (input)
      input.click();
  }
  onExcelFileSelected(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      this.excelFile = input.files[0];
    }
  }
  onPdfFileSelected(event) {
    const input = event.target;
    if (input.files && input.files.length) {
      const newFiles = Array.from(input.files).filter((f) => f.name.endsWith(".pdf"));
      this.pdfFiles = [...this.pdfFiles, ...newFiles];
      input.value = "";
    }
  }
  removePdf(index, event) {
    event.stopPropagation();
    this.pdfFiles.splice(index, 1);
  }
  onDragOver(event) {
    event.preventDefault();
  }
  onDropExcel(event) {
    event.preventDefault();
    const dataTransfer = event;
    if (dataTransfer.dataTransfer?.files && dataTransfer.dataTransfer.files[0]) {
      this.excelFile = dataTransfer.dataTransfer.files[0];
    }
  }
  onDropPdf(event) {
    event.preventDefault();
    const dataTransfer = event;
    if (dataTransfer.dataTransfer?.files && dataTransfer.dataTransfer.files.length) {
      const newFiles = Array.from(dataTransfer.dataTransfer.files).filter((f) => f.name.endsWith(".pdf"));
      this.pdfFiles = [...this.pdfFiles, ...newFiles];
    }
  }
  onClientChange(event) {
    const target = event.target;
    this.selectedClientId = target.value ? parseInt(target.value, 10) : 0;
    this.importState.setSelectedClientId(this.selectedClientId);
  }
  cancelExcel() {
    this.excelFile = null;
    const input = document.querySelector("#excelFileInput");
    if (input)
      input.value = "";
  }
  cancelPdf() {
    this.pdfFiles = [];
    this.selectedClientId = 0;
    this.analysisResults = [];
    this.analyzedCount = 0;
    this.importState.clear();
    const input = document.querySelector("#pdfFileInput");
    if (input)
      input.value = "";
  }
  importExcel() {
    if (!this.excelFile)
      return;
    this.isImporting = true;
    this.message = "";
    const formData = new FormData();
    formData.append("file", this.excelFile);
    this.apiService.uploadFile("/import/excel", formData).subscribe({
      next: (response) => {
        this.isImporting = false;
        this.message = `Importazione completata: ${response?.cardsImported ?? 0} schede create` + (response?.errors ? `, ${response.errors} righe scartate` : "");
        this.messageType = "success";
        this.cancelExcel();
        setTimeout(() => this.message = "", 5e3);
      },
      error: (error) => {
        this.isImporting = false;
        this.message = "Errore nell'importazione: " + (error.error?.message || error.message);
        this.messageType = "error";
      }
    });
  }
  analyzePdfs() {
    if (!this.pdfFiles.length)
      return;
    this.isAnalyzing = true;
    this.message = "";
    this.analyzedCount = 0;
    this.importState.clearResults();
    const files = [...this.pdfFiles];
    const analyzeNext = (index) => {
      if (index >= files.length) {
        this.isAnalyzing = false;
        const ok = this.analysisResults.filter((r) => r.success).length;
        this.message = `Analisi completata: ${ok}/${files.length} file elaborati con successo.`;
        this.messageType = ok === files.length ? "success" : "error";
        this.importState.setMessage(this.message, this.messageType);
        return;
      }
      const file = files[index];
      const formData = new FormData();
      if (this.selectedClientId)
        formData.append("clientId", this.selectedClientId.toString());
      formData.append("pdfFile", file);
      this.apiService.uploadFile("/safety-cards/analyze-pdf", formData).subscribe({
        next: (response) => {
          this.analyzedCount = index + 1;
          const result = {
            fileName: file.name,
            success: true,
            message: response.message || "Scheda creata con successo"
          };
          this.importState.addAnalysisResult(result);
          analyzeNext(index + 1);
        },
        error: (error) => {
          this.analyzedCount = index + 1;
          const result = {
            fileName: file.name,
            success: false,
            message: error.error?.message || error.message || "Errore durante l'analisi"
          };
          this.importState.addAnalysisResult(result);
          analyzeNext(index + 1);
        }
      });
    };
    analyzeNext(0);
  }
  static \u0275fac = function ImportComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImportComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(ImportStateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ImportComponent, selectors: [["app-import"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 30, vars: 8, consts: [[1, "import-page"], [1, "import-options"], [1, "import-card"], [1, "drop-zone", 3, "click", "dragover", "drop"], [4, "ngIf"], ["class", "file-name", 4, "ngIf"], [1, "btn", "btn-primary", 3, "click"], ["type", "file", "hidden", "", "id", "excelFileInput", "accept", ".xlsx,.xls", 3, "change"], ["class", "import-actions", 4, "ngIf"], ["class", "file-list", 4, "ngIf"], [1, "btn", "btn-secondary", 3, "click"], ["type", "file", "hidden", "", "id", "pdfFileInput", "accept", ".pdf", "multiple", "", 3, "change"], ["class", "analysis-results", 4, "ngIf"], ["class", "message", 3, "ngClass", 4, "ngIf"], [1, "file-name"], [1, "import-actions"], [1, "btn", "btn-success", 3, "click", "disabled"], [1, "file-list"], ["class", "file-item", 4, "ngFor", "ngForOf"], [1, "file-item"], ["title", "Rimuovi", 1, "btn-remove", 3, "click"], [1, "form-group"], ["for", "clientId"], ["id", "clientId", 1, "form-control", 3, "change"], ["value", ""], [3, "value", "selected", 4, "ngFor", "ngForOf"], ["class", "spinner-border spinner-border-sm me-2", "role", "status", "aria-hidden", "true", 4, "ngIf"], [3, "value", "selected"], ["role", "status", "aria-hidden", "true", 1, "spinner-border", "spinner-border-sm", "me-2"], [1, "analysis-results"], ["class", "result-item", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "result-item", 3, "ngClass"], [1, "message", 3, "ngClass"]], template: function ImportComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "h1");
      \u0275\u0275text(2, "Import Dati");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(3, "div", 1)(4, "div", 2)(5, "h2");
      \u0275\u0275text(6, "Import da Excel");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "p");
      \u0275\u0275text(8, "Carica un file Excel (.xlsx): ogni riga diventa una scheda di sicurezza (SDS) del cliente indicato");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "div", 3);
      \u0275\u0275listener("click", function ImportComponent_Template_div_click_9_listener() {
        return ctx.triggerExcelUpload();
      })("dragover", function ImportComponent_Template_div_dragover_9_listener($event) {
        return ctx.onDragOver($event);
      })("drop", function ImportComponent_Template_div_drop_9_listener($event) {
        return ctx.onDropExcel($event);
      });
      \u0275\u0275template(10, ImportComponent_p_10_Template, 2, 0, "p", 4)(11, ImportComponent_p_11_Template, 2, 1, "p", 5);
      \u0275\u0275elementStart(12, "button", 6);
      \u0275\u0275listener("click", function ImportComponent_Template_button_click_12_listener($event) {
        return ctx.triggerExcelUpload($event);
      });
      \u0275\u0275text(13, "Scegli File");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "input", 7);
      \u0275\u0275listener("change", function ImportComponent_Template_input_change_14_listener($event) {
        return ctx.onExcelFileSelected($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275template(15, ImportComponent_div_15_Template, 5, 2, "div", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "div", 2)(17, "h2");
      \u0275\u0275text(18, "Analisi PDF con LLM");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "p");
      \u0275\u0275text(20, "Carica una o pi\xF9 schede di sicurezza (SDS) in PDF: per ognuna viene creata una scheda con il PDF allegato");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "div", 3);
      \u0275\u0275listener("click", function ImportComponent_Template_div_click_21_listener() {
        return ctx.triggerPdfUpload();
      })("dragover", function ImportComponent_Template_div_dragover_21_listener($event) {
        return ctx.onDragOver($event);
      })("drop", function ImportComponent_Template_div_drop_21_listener($event) {
        return ctx.onDropPdf($event);
      });
      \u0275\u0275template(22, ImportComponent_p_22_Template, 2, 0, "p", 4)(23, ImportComponent_div_23_Template, 2, 1, "div", 9);
      \u0275\u0275elementStart(24, "button", 10);
      \u0275\u0275listener("click", function ImportComponent_Template_button_click_24_listener($event) {
        return ctx.triggerPdfUpload($event);
      });
      \u0275\u0275text(25, "Scegli File");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "input", 11);
      \u0275\u0275listener("change", function ImportComponent_Template_input_change_26_listener($event) {
        return ctx.onPdfFileSelected($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275template(27, ImportComponent_div_27_Template, 13, 4, "div", 8)(28, ImportComponent_div_28_Template, 2, 1, "div", 12);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(29, ImportComponent_div_29_Template, 2, 2, "div", 13);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(10);
      \u0275\u0275property("ngIf", !ctx.excelFile);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.excelFile);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.excelFile);
      \u0275\u0275advance(7);
      \u0275\u0275property("ngIf", !ctx.pdfFiles.length);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.pdfFiles.length);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.pdfFiles.length);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.analysisResults.length);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.message);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf], styles: ["\n\n.import-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.import-page[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  color: #2c3e50;\n}\n.import-options[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));\n  gap: 24px;\n}\n.import-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.import-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin-top: 0;\n  color: #2c3e50;\n}\n.import-card[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] {\n  color: #7f8c8d;\n}\n.drop-zone[_ngcontent-%COMP%] {\n  border: 2px dashed #ddd;\n  border-radius: 8px;\n  padding: 40px;\n  text-align: center;\n  margin-top: 16px;\n  cursor: pointer;\n  transition: border-color 0.2s, background-color 0.2s;\n}\n.drop-zone[_ngcontent-%COMP%]:hover {\n  border-color: #3498db;\n  background-color: #f8f9fa;\n}\n.drop-zone[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n  color: #999;\n}\n.file-name[_ngcontent-%COMP%] {\n  color: #3498db;\n  font-weight: 600;\n  margin-bottom: 12px;\n}\n.import-actions[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.form-group[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 4px;\n  font-weight: 600;\n}\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n.btn-success[_ngcontent-%COMP%] {\n  background: #27ae60;\n}\n.btn-success[_ngcontent-%COMP%]:hover {\n  background: #219a52;\n}\n.btn[_ngcontent-%COMP%]:disabled {\n  background: #bdc3c7;\n  cursor: not-allowed;\n}\n.message[_ngcontent-%COMP%] {\n  margin-top: 24px;\n  padding: 16px;\n  border-radius: 4px;\n  font-weight: 600;\n}\n.message.success[_ngcontent-%COMP%] {\n  background: #d4edda;\n  color: #155724;\n}\n.message.error[_ngcontent-%COMP%] {\n  background: #f8d7da;\n  color: #721c24;\n}\n.file-list[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n  text-align: left;\n  max-height: 160px;\n  overflow-y: auto;\n}\n.file-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 6px 10px;\n  background: #f8f9fa;\n  border-radius: 4px;\n  margin-bottom: 4px;\n}\n.file-item[_ngcontent-%COMP%]   .file-name[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n  font-size: 13px;\n}\n.btn-remove[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #e74c3c;\n  font-size: 18px;\n  cursor: pointer;\n  padding: 0 6px;\n  line-height: 1;\n}\n.btn-remove[_ngcontent-%COMP%]:hover {\n  color: #c0392b;\n}\n.analysis-results[_ngcontent-%COMP%] {\n  margin-top: 16px;\n}\n.result-item[_ngcontent-%COMP%] {\n  padding: 10px 14px;\n  border-radius: 4px;\n  margin-bottom: 6px;\n  font-size: 14px;\n}\n.result-ok[_ngcontent-%COMP%] {\n  background: #d4edda;\n  color: #155724;\n}\n.result-fail[_ngcontent-%COMP%] {\n  background: #f8d7da;\n  color: #721c24;\n}\n/*# sourceMappingURL=import.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ImportComponent, { className: "ImportComponent", filePath: "src\\app\\features\\import\\components\\import.component.ts", lineNumber: 14 });
})();
export {
  ImportComponent
};
//# sourceMappingURL=chunk-LKR5MSFR.js.map
