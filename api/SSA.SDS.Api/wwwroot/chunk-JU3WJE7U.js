import {
  CheckboxControlValueAccessor,
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MinValidator,
  NgControlStatus,
  NgControlStatusGroup,
  NgSelectOption,
  NumberValueAccessor,
  ReactiveFormsModule,
  SelectControlValueAccessor,
  Validators,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption
} from "./chunk-VX5KSKYT.js";
import {
  SafetyCardService
} from "./chunk-YV7K3B3X.js";
import "./chunk-PX24KK2F.js";
import {
  ClientService
} from "./chunk-PB6NFXHV.js";
import {
  ActivatedRoute,
  Router,
  RouterLink
} from "./chunk-U3ABJN4X.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  __spreadProps,
  __spreadValues,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
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
} from "./chunk-HDSUHL5P.js";

// src/app/features/safety-cards/components/card-form.component.ts
function CardFormComponent_option_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 45);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const client_r1 = ctx.$implicit;
    \u0275\u0275property("value", client_r1.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", client_r1.ragioneSociale, " ");
  }
}
function CardFormComponent_div_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_77_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 47)(1, "h2");
    \u0275\u0275text(2, "Dati della Scheda di Sicurezza");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 5)(4, "div", 6)(5, "label", 48);
    \u0275\u0275text(6, "Frasi H (sez. 2.1)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(7, "input", 49);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 6)(9, "label", 50);
    \u0275\u0275text(10, "Pittogrammi (sez. 2.2)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(11, "input", 51);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 19)(13, "label", 52);
    \u0275\u0275text(14, "Composizione n. CAS > 0,1% (sez. 3)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(15, "textarea", 53);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 19)(17, "label", 54);
    \u0275\u0275text(18, "Composizione n. CAS < 0,1% (sez. 3)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(19, "textarea", 55);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 19)(21, "label", 56);
    \u0275\u0275text(22, "Composizione (sez. 3)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(23, "textarea", 57);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "div", 6)(25, "label", 58);
    \u0275\u0275text(26, "Stato fisico (sez. 9)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(27, "input", 59);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 6)(29, "label", 60);
    \u0275\u0275text(30, "Temperatura di ebollizione (sez. 9)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(31, "input", 61);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "div", 6)(33, "label", 62);
    \u0275\u0275text(34, "COV %");
    \u0275\u0275elementEnd();
    \u0275\u0275element(35, "input", 63);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "div", 6)(37, "label", 64);
    \u0275\u0275text(38, "Densit\xE0 (sez. 9)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(39, "input", 65);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "div", 6)(41, "label", 66);
    \u0275\u0275text(42, "URL SDS");
    \u0275\u0275elementEnd();
    \u0275\u0275element(43, "input", 67);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(44, "div", 68)(45, "label");
    \u0275\u0275element(46, "input", 69);
    \u0275\u0275text(47, " Contiene diisocianati ");
    \u0275\u0275elementEnd()()()();
  }
}
function CardFormComponent_div_78_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 75)(1, "p")(2, "strong");
    \u0275\u0275text(3, "File attuale:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 76);
    \u0275\u0275listener("click", function CardFormComponent_div_78_div_3_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.deletePdf());
    });
    \u0275\u0275text(6, "Rimuovi PDF");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r3.pdfFileName, "");
  }
}
function CardFormComponent_div_78_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 70)(1, "h2");
    \u0275\u0275text(2, "File PDF della Scheda");
    \u0275\u0275elementEnd();
    \u0275\u0275template(3, CardFormComponent_div_78_div_3_Template, 7, 1, "div", 71);
    \u0275\u0275elementStart(4, "div", 72)(5, "input", 73);
    \u0275\u0275listener("change", function CardFormComponent_div_78_Template_input_change_5_listener($event) {
      \u0275\u0275restoreView(_r2);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onPdfSelected($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 74);
    \u0275\u0275listener("click", function CardFormComponent_div_78_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.uploadPdf());
    });
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r3.pdfFileName);
    \u0275\u0275advance(3);
    \u0275\u0275property("disabled", !ctx_r3.selectedPdf || ctx_r3.isUploadingPdf);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r3.isUploadingPdf ? "Caricamento..." : "Carica PDF", " ");
  }
}
var CardFormComponent = class _CardFormComponent {
  fb;
  route;
  router;
  cardService;
  clientService;
  cardForm;
  clients = [];
  isEdit = false;
  isSubmitting = false;
  isUploadingPdf = false;
  selectedPdf = null;
  pdfFileName = "";
  cardId;
  // Campi specifici delle schede di sicurezza (SDS), con lo stesso nome nel form e nell'API
  sdsTextFields = [
    "frasiH",
    "pittogrammi",
    "composizioneCasSopra",
    "composizioneCasSotto",
    "composizione",
    "statoFisico",
    "temperaturaEbollizione",
    "covPercent",
    "densita",
    "sdsUrl"
  ];
  get isSds() {
    return this.cardForm?.get("tipologia")?.value === "SDS";
  }
  constructor(fb, route, router, cardService, clientService) {
    this.fb = fb;
    this.route = route;
    this.router = router;
    this.cardService = cardService;
    this.clientService = clientService;
  }
  ngOnInit() {
    this.cardId = Number(this.route.snapshot.paramMap.get("id"));
    this.isEdit = !!this.cardId;
    this.initForm();
    this.loadClients();
    if (this.isEdit) {
      this.loadCard();
    } else {
      const clientId = this.route.snapshot.queryParamMap.get("clientId");
      if (clientId) {
        this.cardForm.patchValue({ clientId });
      }
    }
  }
  initForm() {
    this.cardForm = this.fb.group(__spreadProps(__spreadValues({
      clientId: ["", [Validators.required]],
      tipologia: ["", [Validators.required]],
      titolo: ["", [Validators.required, Validators.minLength(3)]],
      numeroProtocollo: [""],
      enteEmittitore: [""],
      dataRilascio: [""],
      dataScadenza: [""],
      validitaMesi: [null],
      frequenzaControllo: [""],
      osservazioni: [""]
    }, Object.fromEntries(this.sdsTextFields.map((f) => [f, [""]]))), {
      contieneDiisocianati: [false]
    }));
  }
  loadClients() {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: () => {
        console.error("Errore nel caricamento clienti");
      }
    });
  }
  loadCard() {
    if (!this.cardId)
      return;
    this.cardService.getCard(this.cardId).subscribe({
      next: (card) => {
        this.cardForm.patchValue(__spreadProps(__spreadValues({
          clientId: card.clientId,
          tipologia: card.tipologia,
          titolo: card.titolo,
          numeroProtocollo: card.numeroProtocollo,
          enteEmittitore: card.enteEmittitore,
          // Le date arrivano dall'API come stringhe ISO, non come Date
          dataRilascio: card.dataRilascio ? String(card.dataRilascio).substring(0, 10) : "",
          dataScadenza: card.dataScadenza ? String(card.dataScadenza).substring(0, 10) : "",
          validitaMesi: card.validitaMesi,
          frequenzaControllo: card.frequenzaControllo,
          osservazioni: card.osservazioni
        }, Object.fromEntries(this.sdsTextFields.map((f) => [f, card[f] ?? ""]))), {
          contieneDiisocianati: !!card.contieneDiisocianati
        }));
        this.pdfFileName = card.pdfUrl ? card.pdfUrl.split("/").pop() || "PDF allegato" : "";
      },
      error: () => {
        alert("Errore nel caricamento della scheda");
        this.router.navigate(["/safety-cards"]);
      }
    });
  }
  onSubmit() {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = this.cardForm.value;
    const request = {
      // Il select restituisce una stringa, l'API si aspetta un int
      clientId: Number(formData.clientId),
      tipologia: formData.tipologia,
      titolo: formData.titolo,
      numeroProtocollo: formData.numeroProtocollo,
      enteEmittitore: formData.enteEmittitore,
      dataRilascio: formData.dataRilascio ? new Date(formData.dataRilascio) : void 0,
      dataScadenza: formData.dataScadenza ? new Date(formData.dataScadenza) : void 0,
      validitaMesi: formData.validitaMesi === "" || formData.validitaMesi === null ? void 0 : Number(formData.validitaMesi),
      frequenzaControllo: formData.frequenzaControllo,
      osservazioni: formData.osservazioni
    };
    if (formData.tipologia === "SDS") {
      for (const f of this.sdsTextFields) {
        request[f] = formData[f] || void 0;
      }
      request.contieneDiisocianati = formData.contieneDiisocianati || void 0;
    }
    if (this.isEdit && this.cardId) {
      this.cardService.updateCard(this.cardId, request).subscribe({
        next: () => {
          alert("Scheda aggiornata con successo");
          this.router.navigate(["/safety-cards"]);
        },
        error: () => {
          alert("Errore nell'aggiornamento della scheda");
          this.isSubmitting = false;
        }
      });
    } else {
      this.cardService.createCard(request).subscribe({
        next: () => {
          alert("Scheda creata con successo");
          this.router.navigate(["/safety-cards"]);
        },
        error: () => {
          alert("Errore nella creazione della scheda");
          this.isSubmitting = false;
        }
      });
    }
  }
  onCancel() {
    this.router.navigate(["/safety-cards"]);
  }
  onPdfSelected(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      this.selectedPdf = input.files[0];
    }
  }
  uploadPdf() {
    if (!this.selectedPdf || !this.cardId)
      return;
    this.isUploadingPdf = true;
    const formData = new FormData();
    formData.append("file", this.selectedPdf);
    this.cardService.uploadPdf(this.cardId, formData).subscribe({
      next: () => {
        this.pdfFileName = this.selectedPdf.name;
        this.selectedPdf = null;
        this.isUploadingPdf = false;
        alert("PDF caricato con successo");
      },
      error: () => {
        alert("Errore nel caricamento del PDF");
        this.isUploadingPdf = false;
      }
    });
  }
  deletePdf() {
    if (!this.cardId)
      return;
    this.cardService.deletePdf(this.cardId).subscribe({
      next: () => {
        this.pdfFileName = "";
        alert("PDF rimosso");
      },
      error: () => alert("Errore nella rimozione del PDF")
    });
  }
  static \u0275fac = function CardFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardFormComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(SafetyCardService), \u0275\u0275directiveInject(ClientService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardFormComponent, selectors: [["app-card-form"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 84, vars: 13, consts: [[1, "card-form-page"], [1, "page-header"], ["routerLink", "/safety-cards", 1, "btn", "btn-secondary"], [1, "form-container"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], [1, "form-group"], ["for", "clientId"], ["id", "clientId", "formControlName", "clientId", 1, "form-control"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["class", "error-message", 4, "ngIf"], ["for", "tipologia"], ["id", "tipologia", "formControlName", "tipologia", 1, "form-control"], ["value", "SDS"], ["value", "DPI"], ["value", "Antincendio"], ["value", "Rischi"], ["value", "Altro"], [1, "form-group", "full-width"], ["for", "titolo"], ["type", "text", "id", "titolo", "formControlName", "titolo", 1, "form-control"], ["for", "numeroProtocollo"], ["type", "text", "id", "numeroProtocollo", "formControlName", "numeroProtocollo", 1, "form-control"], ["for", "enteEmittitore"], ["type", "text", "id", "enteEmittitore", "formControlName", "enteEmittitore", 1, "form-control"], ["for", "dataRilascio"], ["type", "date", "id", "dataRilascio", "formControlName", "dataRilascio", 1, "form-control"], ["for", "dataScadenza"], ["type", "date", "id", "dataScadenza", "formControlName", "dataScadenza", 1, "form-control"], ["for", "validitaMesi"], ["type", "number", "id", "validitaMesi", "formControlName", "validitaMesi", "min", "1", 1, "form-control"], ["for", "frequenzaControllo"], ["id", "frequenzaControllo", "formControlName", "frequenzaControllo", 1, "form-control"], ["value", "mensile"], ["value", "trimestrale"], ["value", "semestrale"], ["value", "annuale"], ["for", "osservazioni"], ["id", "osservazioni", "formControlName", "osservazioni", "rows", "4", 1, "form-control"], ["class", "sds-section", 4, "ngIf"], ["class", "pdf-section", 4, "ngIf"], [1, "form-actions"], ["type", "button", 1, "btn", "btn-secondary", 3, "click"], ["type", "submit", 1, "btn", "btn-primary", 3, "disabled"], [3, "value"], [1, "error-message"], [1, "sds-section"], ["for", "frasiH"], ["type", "text", "id", "frasiH", "formControlName", "frasiH", "placeholder", "es. H225, H319", 1, "form-control"], ["for", "pittogrammi"], ["type", "text", "id", "pittogrammi", "formControlName", "pittogrammi", "placeholder", "es. GHS02, GHS07", 1, "form-control"], ["for", "composizioneCasSopra"], ["id", "composizioneCasSopra", "formControlName", "composizioneCasSopra", "rows", "2", 1, "form-control"], ["for", "composizioneCasSotto"], ["id", "composizioneCasSotto", "formControlName", "composizioneCasSotto", "rows", "2", 1, "form-control"], ["for", "composizione"], ["id", "composizione", "formControlName", "composizione", "rows", "3", 1, "form-control"], ["for", "statoFisico"], ["type", "text", "id", "statoFisico", "formControlName", "statoFisico", 1, "form-control"], ["for", "temperaturaEbollizione"], ["type", "text", "id", "temperaturaEbollizione", "formControlName", "temperaturaEbollizione", 1, "form-control"], ["for", "covPercent"], ["type", "text", "id", "covPercent", "formControlName", "covPercent", 1, "form-control"], ["for", "densita"], ["type", "text", "id", "densita", "formControlName", "densita", 1, "form-control"], ["for", "sdsUrl"], ["type", "text", "id", "sdsUrl", "formControlName", "sdsUrl", 1, "form-control"], [1, "form-group", "checkbox-group"], ["type", "checkbox", "id", "contieneDiisocianati", "formControlName", "contieneDiisocianati"], [1, "pdf-section"], ["class", "pdf-current", 4, "ngIf"], [1, "pdf-upload"], ["type", "file", "accept", ".pdf", 3, "change"], ["type", "button", 1, "btn", "btn-primary", 3, "click", "disabled"], [1, "pdf-current"], ["type", "button", 1, "btn", "btn-danger", 3, "click"]], template: function CardFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 2);
      \u0275\u0275text(5, "Torna alla lista");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 3)(7, "form", 4);
      \u0275\u0275listener("ngSubmit", function CardFormComponent_Template_form_ngSubmit_7_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(8, "div", 5)(9, "div", 6)(10, "label", 7);
      \u0275\u0275text(11, "Cliente *");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "select", 8)(13, "option", 9);
      \u0275\u0275text(14, "Seleziona cliente");
      \u0275\u0275elementEnd();
      \u0275\u0275template(15, CardFormComponent_option_15_Template, 2, 2, "option", 10);
      \u0275\u0275elementEnd();
      \u0275\u0275template(16, CardFormComponent_div_16_Template, 2, 0, "div", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "div", 6)(18, "label", 12);
      \u0275\u0275text(19, "Tipologia *");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "select", 13)(21, "option", 9);
      \u0275\u0275text(22, "Seleziona tipologia");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "option", 14);
      \u0275\u0275text(24, "Scheda di Sicurezza (SDS)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "option", 15);
      \u0275\u0275text(26, "DPI");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "option", 16);
      \u0275\u0275text(28, "Antincendio");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "option", 17);
      \u0275\u0275text(30, "Valutazione Rischi");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "option", 18);
      \u0275\u0275text(32, "Altro");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(33, CardFormComponent_div_33_Template, 2, 0, "div", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "div", 19)(35, "label", 20);
      \u0275\u0275text(36, "Titolo *");
      \u0275\u0275elementEnd();
      \u0275\u0275element(37, "input", 21);
      \u0275\u0275template(38, CardFormComponent_div_38_Template, 2, 0, "div", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(39, "div", 6)(40, "label", 22);
      \u0275\u0275text(41);
      \u0275\u0275elementEnd();
      \u0275\u0275element(42, "input", 23);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "div", 6)(44, "label", 24);
      \u0275\u0275text(45);
      \u0275\u0275elementEnd();
      \u0275\u0275element(46, "input", 25);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(47, "div", 6)(48, "label", 26);
      \u0275\u0275text(49);
      \u0275\u0275elementEnd();
      \u0275\u0275element(50, "input", 27);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(51, "div", 6)(52, "label", 28);
      \u0275\u0275text(53, "Data Scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275element(54, "input", 29);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(55, "div", 6)(56, "label", 30);
      \u0275\u0275text(57, "Validit\xE0 (mesi)");
      \u0275\u0275elementEnd();
      \u0275\u0275element(58, "input", 31);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(59, "div", 6)(60, "label", 32);
      \u0275\u0275text(61, "Frequenza Controllo");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(62, "select", 33)(63, "option", 9);
      \u0275\u0275text(64, "Seleziona frequenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(65, "option", 34);
      \u0275\u0275text(66, "Mensile");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(67, "option", 35);
      \u0275\u0275text(68, "Trimestrale");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(69, "option", 36);
      \u0275\u0275text(70, "Semestrale");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(71, "option", 37);
      \u0275\u0275text(72, "Annuale");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(73, "div", 19)(74, "label", 38);
      \u0275\u0275text(75, "Osservazioni");
      \u0275\u0275elementEnd();
      \u0275\u0275element(76, "textarea", 39);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(77, CardFormComponent_div_77_Template, 48, 0, "div", 40)(78, CardFormComponent_div_78_Template, 8, 3, "div", 41);
      \u0275\u0275elementStart(79, "div", 42)(80, "button", 43);
      \u0275\u0275listener("click", function CardFormComponent_Template_button_click_80_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(81, "Annulla");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "button", 44);
      \u0275\u0275text(83);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      let tmp_3_0;
      let tmp_4_0;
      let tmp_5_0;
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isEdit ? "Modifica Scheda" : "Nuova Scheda");
      \u0275\u0275advance(4);
      \u0275\u0275property("formGroup", ctx.cardForm);
      \u0275\u0275advance(8);
      \u0275\u0275property("ngForOf", ctx.clients);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ((tmp_3_0 = ctx.cardForm.get("clientId")) == null ? null : tmp_3_0.errors == null ? null : tmp_3_0.errors["required"]) && ((tmp_3_0 = ctx.cardForm.get("clientId")) == null ? null : tmp_3_0.touched));
      \u0275\u0275advance(17);
      \u0275\u0275property("ngIf", ((tmp_4_0 = ctx.cardForm.get("tipologia")) == null ? null : tmp_4_0.errors == null ? null : tmp_4_0.errors["required"]) && ((tmp_4_0 = ctx.cardForm.get("tipologia")) == null ? null : tmp_4_0.touched));
      \u0275\u0275advance(5);
      \u0275\u0275property("ngIf", ((tmp_5_0 = ctx.cardForm.get("titolo")) == null ? null : tmp_5_0.errors == null ? null : tmp_5_0.errors["required"]) && ((tmp_5_0 = ctx.cardForm.get("titolo")) == null ? null : tmp_5_0.touched));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isSds ? "Versione / Revisione SDS" : "Numero Protocollo");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isSds ? "Produttore" : "Ente Emittitore");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isSds ? "Data SDS" : "Data Rilascio");
      \u0275\u0275advance(28);
      \u0275\u0275property("ngIf", ctx.isSds);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isEdit && ctx.cardId);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", ctx.cardForm.invalid || ctx.isSubmitting);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isSubmitting ? "Salvataggio..." : ctx.isEdit ? "Aggiorna" : "Crea", " ");
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, ReactiveFormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, MinValidator, FormGroupDirective, FormControlName, RouterLink], styles: ["\n\n.card-form-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.form-container[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 32px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 20px;\n  margin-bottom: 24px;\n}\n.form-group.full-width[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 8px;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #3498db;\n  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);\n}\n.error-message[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-size: 12px;\n  margin-top: 4px;\n}\n.sds-section[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  padding: 20px;\n  border: 1px solid #e1e8ed;\n  border-radius: 8px;\n}\n.sds-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 16px 0;\n  color: #2c3e50;\n  font-size: 16px;\n}\n.checkbox-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 30px;\n  font-weight: 600;\n}\n.pdf-section[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  padding: 20px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}\n.pdf-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 14px 0;\n  color: #2c3e50;\n  font-size: 16px;\n}\n.pdf-current[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 14px;\n  padding: 12px;\n  background: #fff;\n  border-radius: 6px;\n}\n.pdf-current[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.pdf-upload[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.btn-danger[_ngcontent-%COMP%] {\n  background: #e74c3c;\n  color: white;\n}\n.btn-danger[_ngcontent-%COMP%]:hover {\n  background: #c0392b;\n}\n.form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding-top: 24px;\n  border-top: 1px solid #eee;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  background: #bdc3c7;\n  cursor: not-allowed;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n  color: white;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n@media (max-width: 768px) {\n  .form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=card-form.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardFormComponent, { className: "CardFormComponent", filePath: "src\\app\\features\\safety-cards\\components\\card-form.component.ts", lineNumber: 295 });
})();
export {
  CardFormComponent
};
//# sourceMappingURL=chunk-JU3WJE7U.js.map
