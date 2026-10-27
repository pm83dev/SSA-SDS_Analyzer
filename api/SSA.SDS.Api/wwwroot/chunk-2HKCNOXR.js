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
} from "./chunk-ST22XY74.js";
import {
  SDS_FIELDS,
  fieldLabel
} from "./chunk-6QO6FDOT.js";
import {
  SafetyCardService
} from "./chunk-OFYPDFIK.js";
import "./chunk-APIYY3YU.js";
import {
  ClientService
} from "./chunk-JTHXEV7M.js";
import {
  ActivatedRoute,
  Router,
  RouterLink
} from "./chunk-HKNCC5DQ.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  __spreadProps,
  __spreadValues,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-XOMSVR7A.js";

// src/app/features/safety-cards/components/card-form.component.ts
function CardFormComponent_label_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 47)(1, "input", 48);
    \u0275\u0275listener("change", function CardFormComponent_label_15_Template_input_change_1_listener($event) {
      const client_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.toggleClient(client_r3.id, $event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const client_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r3.selectedClientIds.has(client_r3.id));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", client_r3.id, " \u2013 ", client_r3.ragioneSociale, " ");
  }
}
function CardFormComponent_span_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 8);
    \u0275\u0275text(1, "Nessun cliente registrato");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_34_li_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li")(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const k_r5 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.fieldLabel(k_r5));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(": ", ctx_r3.reasonsFor(k_r5), "");
  }
}
function CardFormComponent_div_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50)(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4, "L'import non ha ritrovato questi dati nel testo della SDS e non li ha inseriti: controllali sul PDF e completali. Un campo esce dall'elenco quando lo modifichi.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "ul");
    \u0275\u0275template(6, CardFormComponent_div_34_li_6_Template, 4, 2, "li", 51);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("\u26A0 ", ctx_r3.campiDaVerificare.length, " ", ctx_r3.campiDaVerificare.length === 1 ? "campo da verificare" : "campi da verificare", " sulla scheda PDF");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r3.campiDaVerificare);
  }
}
function CardFormComponent_div_35_div_4_label_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "label", 62);
    \u0275\u0275element(1, "input", 63);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("id", f_r6.key)("formControlName", f_r6.key);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", f_r6.label, " ");
  }
}
function CardFormComponent_div_35_div_4_label_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "label", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("for", f_r6.key);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", f_r6.label, "", f_r6.key === "titolo" ? " *" : "", "");
  }
}
function CardFormComponent_div_35_div_4_small_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small", 8);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(f_r6.hint);
  }
}
function CardFormComponent_div_35_div_4_small_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small", 65);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u26A0 da verificare: ", ctx_r3.reasonsFor(f_r6.key), "");
  }
}
function CardFormComponent_div_35_div_4_textarea_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "textarea", 66);
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("id", f_r6.key)("formControlName", f_r6.key);
  }
}
function CardFormComponent_div_35_div_4_textarea_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "textarea", 67);
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("id", f_r6.key)("formControlName", f_r6.key);
  }
}
function CardFormComponent_div_35_div_4_input_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "input", 68);
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("id", f_r6.key)("formControlName", f_r6.key);
  }
}
function CardFormComponent_div_35_div_4_ng_container_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function CardFormComponent_div_35_div_4_input_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "input", 69);
  }
  if (rf & 2) {
    const f_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("id", f_r6.key)("formControlName", f_r6.key)("placeholder", f_r6.kind === "hcodes" ? "es. H225, H319" : f_r6.kind === "ghs" ? "es. GHS02, GHS07" : f_r6.kind === "url" ? "https://..." : "");
  }
}
function CardFormComponent_div_35_div_4_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_35_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275elementContainerStart(1, 54);
    \u0275\u0275template(2, CardFormComponent_div_35_div_4_label_2_Template, 3, 3, "label", 55)(3, CardFormComponent_div_35_div_4_label_3_Template, 2, 3, "label", 56);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(4, CardFormComponent_div_35_div_4_small_4_Template, 2, 1, "small", 11)(5, CardFormComponent_div_35_div_4_small_5_Template, 2, 1, "small", 26);
    \u0275\u0275elementContainerStart(6, 54);
    \u0275\u0275template(7, CardFormComponent_div_35_div_4_textarea_7_Template, 1, 2, "textarea", 57)(8, CardFormComponent_div_35_div_4_textarea_8_Template, 1, 2, "textarea", 58)(9, CardFormComponent_div_35_div_4_input_9_Template, 1, 2, "input", 59)(10, CardFormComponent_div_35_div_4_ng_container_10_Template, 1, 0, "ng-container", 60)(11, CardFormComponent_div_35_div_4_input_11_Template, 1, 3, "input", 61);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(12, CardFormComponent_div_35_div_4_div_12_Template, 2, 0, "div", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_15_0;
    const f_r6 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("full-width", ctx_r3.isWide(f_r6))("field-verify", ctx_r3.campiDaVerificare.includes(f_r6.key));
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitch", f_r6.kind);
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitchCase", "bool");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", f_r6.hint);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r3.campiDaVerificare.includes(f_r6.key));
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitch", f_r6.kind);
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitchCase", "cas");
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitchCase", "names");
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitchCase", "date");
    \u0275\u0275advance();
    \u0275\u0275property("ngSwitchCase", "bool");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", f_r6.key === "titolo" && ((tmp_15_0 = ctx_r3.cardForm.get("titolo")) == null ? null : tmp_15_0.invalid) && ((tmp_15_0 = ctx_r3.cardForm.get("titolo")) == null ? null : tmp_15_0.touched));
  }
}
function CardFormComponent_div_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 52)(1, "h2");
    \u0275\u0275text(2, "Dati da estrapolare");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 6);
    \u0275\u0275template(4, CardFormComponent_div_35_div_4_Template, 13, 14, "div", 53);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r3.sdsFormFields);
  }
}
function CardFormComponent_ng_template_36_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_ng_template_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 39)(2, "label", 70);
    \u0275\u0275text(3, "Titolo *");
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "input", 71);
    \u0275\u0275template(5, CardFormComponent_ng_template_36_div_5_Template, 2, 0, "div", 20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 7)(7, "label", 72);
    \u0275\u0275text(8, "Ente Emittitore");
    \u0275\u0275elementEnd();
    \u0275\u0275element(9, "input", 73);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 7)(11, "label", 74);
    \u0275\u0275text(12, "Data Rilascio");
    \u0275\u0275elementEnd();
    \u0275\u0275element(13, "input", 75);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", ((tmp_2_0 = ctx_r3.cardForm.get("titolo")) == null ? null : tmp_2_0.errors == null ? null : tmp_2_0.errors["required"]) && ((tmp_2_0 = ctx_r3.cardForm.get("titolo")) == null ? null : tmp_2_0.touched));
  }
}
function CardFormComponent_h2_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1, "Gestione scheda");
    \u0275\u0275elementEnd();
  }
}
function CardFormComponent_div_41_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 39)(1, "label");
    \u0275\u0275text(2, "Nome file importato");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 76);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r3.nomeFileImportato);
  }
}
function CardFormComponent_small_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small", 65);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u26A0 da verificare: ", ctx_r3.reasonsFor("numeroProtocollo"), "");
  }
}
function CardFormComponent_div_73_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 82)(1, "p")(2, "strong");
    \u0275\u0275text(3, "File attuale:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 83);
    \u0275\u0275listener("click", function CardFormComponent_div_73_div_3_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r8);
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
function CardFormComponent_div_73_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 77)(1, "h2");
    \u0275\u0275text(2, "File PDF della Scheda");
    \u0275\u0275elementEnd();
    \u0275\u0275template(3, CardFormComponent_div_73_div_3_Template, 7, 1, "div", 78);
    \u0275\u0275elementStart(4, "div", 79)(5, "input", 80);
    \u0275\u0275listener("change", function CardFormComponent_div_73_Template_input_change_5_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onPdfSelected($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 81);
    \u0275\u0275listener("click", function CardFormComponent_div_73_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r7);
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
function CardFormComponent_label_74_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 84)(1, "input", 48);
    \u0275\u0275listener("change", function CardFormComponent_label_74_Template_input_change_1_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.datiVerificati = $event.target.checked);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(2, ' Ho verificato tutti i dati con la scheda PDF (toglie tutti i "da verificare") ');
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r3.datiVerificati);
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
  nomeFileImportato = "";
  // Campi che l'import PDF non ha ritrovato nel testo della SDS
  campiDaVerificare = [];
  noteVerifica = "";
  datiVerificati = false;
  fieldLabel = fieldLabel;
  reasonsFor(key) {
    return (this.noteVerifica ?? "").split("\n").filter((l) => l.startsWith(key + ":")).map((l) => l.slice(key.length + 1).trim()).join("; ");
  }
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
  // Campi del file "dati per SDS.xlsx" nel form (il cliente è già in testa al form)
  sdsFormFields = SDS_FIELDS.filter((f) => f.key !== "clients" && !f.readonly);
  // Clienti collegati alla scheda (zero, uno o più)
  selectedClientIds = /* @__PURE__ */ new Set();
  toggleClient(id, checked) {
    if (checked)
      this.selectedClientIds.add(id);
    else
      this.selectedClientIds.delete(id);
  }
  get isSds() {
    return this.cardForm?.get("tipologia")?.value === "SDS";
  }
  isWide(field) {
    return field.kind === "cas" || field.kind === "names";
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
      const clientId = Number(this.route.snapshot.queryParamMap.get("clientId"));
      if (clientId) {
        this.selectedClientIds.add(clientId);
      }
    }
  }
  initForm() {
    this.cardForm = this.fb.group(__spreadProps(__spreadValues({
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
        this.selectedClientIds = new Set(card.clients.map((c) => c.id));
        this.cardForm.patchValue(__spreadProps(__spreadValues({
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
        this.nomeFileImportato = card.nomeFileImportato ?? "";
        this.campiDaVerificare = card.campiDaVerificare ?? [];
        this.noteVerifica = card.noteVerifica ?? "";
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
      clientIds: [...this.selectedClientIds],
      tipologia: formData.tipologia,
      titolo: formData.titolo,
      numeroProtocollo: formData.numeroProtocollo,
      enteEmittitore: formData.enteEmittitore,
      dataRilascio: formData.dataRilascio ? new Date(formData.dataRilascio) : void 0,
      dataScadenza: formData.dataScadenza ? new Date(formData.dataScadenza) : void 0,
      validitaMesi: formData.validitaMesi === "" || formData.validitaMesi === null ? void 0 : Number(formData.validitaMesi),
      frequenzaControllo: formData.frequenzaControllo,
      osservazioni: formData.osservazioni,
      datiVerificati: this.datiVerificati
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
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardFormComponent, selectors: [["app-card-form"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 80, vars: 19, consts: [["genericFields", ""], [1, "card-form-page"], [1, "page-header"], ["routerLink", "/safety-cards", 1, "btn", "btn-secondary"], [1, "form-container"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], [1, "form-group"], [1, "hint"], [1, "client-checks"], ["class", "client-check", 4, "ngFor", "ngForOf"], ["class", "hint", 4, "ngIf"], ["for", "tipologia"], ["id", "tipologia", "formControlName", "tipologia", 1, "form-control"], ["value", ""], ["value", "SDS"], ["value", "DPI"], ["value", "Antincendio"], ["value", "Rischi"], ["value", "Altro"], ["class", "error-message", 4, "ngIf"], ["class", "verify-banner", 4, "ngIf"], ["class", "sds-section", 4, "ngIf", "ngIfElse"], [1, "manage-section"], [4, "ngIf"], ["class", "form-group full-width", 4, "ngIf"], ["class", "verify-hint", 4, "ngIf"], ["for", "numeroProtocollo"], ["type", "text", "id", "numeroProtocollo", "formControlName", "numeroProtocollo", 1, "form-control"], ["for", "dataScadenza"], ["type", "date", "id", "dataScadenza", "formControlName", "dataScadenza", 1, "form-control"], ["for", "validitaMesi"], ["type", "number", "id", "validitaMesi", "formControlName", "validitaMesi", "min", "1", 1, "form-control"], ["for", "frequenzaControllo"], ["id", "frequenzaControllo", "formControlName", "frequenzaControllo", 1, "form-control"], ["value", "mensile"], ["value", "trimestrale"], ["value", "semestrale"], ["value", "annuale"], [1, "form-group", "full-width"], ["for", "osservazioni"], ["id", "osservazioni", "formControlName", "osservazioni", "rows", "3", 1, "form-control"], ["class", "pdf-section", 4, "ngIf"], ["class", "verified-check", 4, "ngIf"], [1, "form-actions"], ["type", "button", 1, "btn", "btn-secondary", 3, "click"], ["type", "submit", 1, "btn", "btn-primary", 3, "disabled"], [1, "client-check"], ["type", "checkbox", 3, "change", "checked"], [1, "error-message"], [1, "verify-banner"], [4, "ngFor", "ngForOf"], [1, "sds-section"], ["class", "form-group", 3, "full-width", "field-verify", 4, "ngFor", "ngForOf"], [3, "ngSwitch"], ["class", "checkbox-label", 4, "ngSwitchCase"], [3, "for", 4, "ngSwitchDefault"], ["class", "form-control", "rows", "3", "placeholder", "nome|n. CAS|%, separati da virgola", 3, "id", "formControlName", 4, "ngSwitchCase"], ["class", "form-control", "rows", "3", 3, "id", "formControlName", 4, "ngSwitchCase"], ["type", "date", "class", "form-control", 3, "id", "formControlName", 4, "ngSwitchCase"], [4, "ngSwitchCase"], ["type", "text", "class", "form-control", 3, "id", "formControlName", "placeholder", 4, "ngSwitchDefault"], [1, "checkbox-label"], ["type", "checkbox", 3, "id", "formControlName"], [3, "for"], [1, "verify-hint"], ["rows", "3", "placeholder", "nome|n. CAS|%, separati da virgola", 1, "form-control", 3, "id", "formControlName"], ["rows", "3", 1, "form-control", 3, "id", "formControlName"], ["type", "date", 1, "form-control", 3, "id", "formControlName"], ["type", "text", 1, "form-control", 3, "id", "formControlName", "placeholder"], ["for", "titolo"], ["type", "text", "id", "titolo", "formControlName", "titolo", 1, "form-control"], ["for", "enteEmittitore"], ["type", "text", "id", "enteEmittitore", "formControlName", "enteEmittitore", 1, "form-control"], ["for", "dataRilascio"], ["type", "date", "id", "dataRilascio", "formControlName", "dataRilascio", 1, "form-control"], [1, "readonly-value"], [1, "pdf-section"], ["class", "pdf-current", 4, "ngIf"], [1, "pdf-upload"], ["type", "file", "accept", ".pdf", 3, "change"], ["type", "button", 1, "btn", "btn-primary", 3, "click", "disabled"], [1, "pdf-current"], ["type", "button", 1, "btn", "btn-danger", 3, "click"], [1, "verified-check"]], template: function CardFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "h1");
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 3);
      \u0275\u0275text(5, "Torna alla lista");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 4)(7, "form", 5);
      \u0275\u0275listener("ngSubmit", function CardFormComponent_Template_form_ngSubmit_7_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onSubmit());
      });
      \u0275\u0275elementStart(8, "div", 6)(9, "div", 7)(10, "label");
      \u0275\u0275text(11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "small", 8);
      \u0275\u0275text(13, "la scheda pu\xF2 essere collegata a pi\xF9 clienti; senza clienti resta solo nell'archivio");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 9);
      \u0275\u0275template(15, CardFormComponent_label_15_Template, 3, 3, "label", 10)(16, CardFormComponent_span_16_Template, 2, 0, "span", 11);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "div", 7)(18, "label", 12);
      \u0275\u0275text(19, "Tipologia *");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "select", 13)(21, "option", 14);
      \u0275\u0275text(22, "Seleziona tipologia");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "option", 15);
      \u0275\u0275text(24, "Scheda di Sicurezza (SDS)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "option", 16);
      \u0275\u0275text(26, "DPI");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "option", 17);
      \u0275\u0275text(28, "Antincendio");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "option", 18);
      \u0275\u0275text(30, "Valutazione Rischi");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "option", 19);
      \u0275\u0275text(32, "Altro");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(33, CardFormComponent_div_33_Template, 2, 0, "div", 20);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(34, CardFormComponent_div_34_Template, 7, 3, "div", 21)(35, CardFormComponent_div_35_Template, 5, 1, "div", 22)(36, CardFormComponent_ng_template_36_Template, 14, 1, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
      \u0275\u0275elementStart(38, "div", 23);
      \u0275\u0275template(39, CardFormComponent_h2_39_Template, 2, 0, "h2", 24);
      \u0275\u0275elementStart(40, "div", 6);
      \u0275\u0275template(41, CardFormComponent_div_41_Template, 5, 1, "div", 25);
      \u0275\u0275elementStart(42, "div", 7);
      \u0275\u0275template(43, CardFormComponent_small_43_Template, 2, 1, "small", 26);
      \u0275\u0275elementStart(44, "label", 27);
      \u0275\u0275text(45);
      \u0275\u0275elementEnd();
      \u0275\u0275element(46, "input", 28);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(47, "div", 7)(48, "label", 29);
      \u0275\u0275text(49, "Data Scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275element(50, "input", 30);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(51, "div", 7)(52, "label", 31);
      \u0275\u0275text(53, "Validit\xE0 (mesi)");
      \u0275\u0275elementEnd();
      \u0275\u0275element(54, "input", 32);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(55, "div", 7)(56, "label", 33);
      \u0275\u0275text(57, "Frequenza Controllo");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "select", 34)(59, "option", 14);
      \u0275\u0275text(60, "Seleziona frequenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(61, "option", 35);
      \u0275\u0275text(62, "Mensile");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(63, "option", 36);
      \u0275\u0275text(64, "Trimestrale");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(65, "option", 37);
      \u0275\u0275text(66, "Semestrale");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(67, "option", 38);
      \u0275\u0275text(68, "Annuale");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(69, "div", 39)(70, "label", 40);
      \u0275\u0275text(71, "Osservazioni");
      \u0275\u0275elementEnd();
      \u0275\u0275element(72, "textarea", 41);
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(73, CardFormComponent_div_73_Template, 8, 3, "div", 42)(74, CardFormComponent_label_74_Template, 3, 1, "label", 43);
      \u0275\u0275elementStart(75, "div", 44)(76, "button", 45);
      \u0275\u0275listener("click", function CardFormComponent_Template_button_click_76_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onCancel());
      });
      \u0275\u0275text(77, "Annulla");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(78, "button", 46);
      \u0275\u0275text(79);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      let tmp_6_0;
      const genericFields_r10 = \u0275\u0275reference(37);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isEdit ? "Modifica Scheda" : "Nuova Scheda");
      \u0275\u0275advance(4);
      \u0275\u0275property("formGroup", ctx.cardForm);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isSds ? "ID CLIENTE" : "Clienti");
      \u0275\u0275advance(4);
      \u0275\u0275property("ngForOf", ctx.clients);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.clients.length);
      \u0275\u0275advance(17);
      \u0275\u0275property("ngIf", ((tmp_6_0 = ctx.cardForm.get("tipologia")) == null ? null : tmp_6_0.errors == null ? null : tmp_6_0.errors["required"]) && ((tmp_6_0 = ctx.cardForm.get("tipologia")) == null ? null : tmp_6_0.touched));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.campiDaVerificare.length);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isSds)("ngIfElse", genericFields_r10);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.isSds);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.nomeFileImportato);
      \u0275\u0275advance();
      \u0275\u0275classProp("field-verify", ctx.campiDaVerificare.includes("numeroProtocollo"));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.campiDaVerificare.includes("numeroProtocollo"));
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.isSds ? "Versione / Revisione SDS" : "Numero Protocollo");
      \u0275\u0275advance(28);
      \u0275\u0275property("ngIf", ctx.isEdit && ctx.cardId);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.campiDaVerificare.length);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", ctx.cardForm.invalid || ctx.isSubmitting);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isSubmitting ? "Salvataggio..." : ctx.isEdit ? "Aggiorna" : "Crea", " ");
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, ReactiveFormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, MinValidator, FormGroupDirective, FormControlName, RouterLink], styles: ["\n\n.card-form-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.form-container[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 32px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 20px;\n  margin-bottom: 24px;\n}\n.form-group.full-width[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 8px;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #3498db;\n  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);\n}\n.error-message[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-size: 12px;\n  margin-top: 4px;\n}\n.sds-section[_ngcontent-%COMP%], \n.manage-section[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  padding: 20px;\n  border: 1px solid #e1e8ed;\n  border-radius: 8px;\n}\n.manage-section[_ngcontent-%COMP%] {\n  border-style: dashed;\n}\n.sds-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], \n.manage-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 16px 0;\n  color: #2c3e50;\n  font-size: 16px;\n}\n.readonly-value[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 8px 12px;\n  background: #f8f9fa;\n  border: 1px solid #eee;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.verify-banner[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n  padding: 12px 16px;\n  border: 1px solid #f0c36d;\n  border-radius: 6px;\n  background: #fff8e6;\n  color: #6b4a00;\n  font-size: 13px;\n}\n.verify-banner[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 4px 0 6px;\n}\n.verify-banner[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 18px;\n}\n.field-verify[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%] {\n  border-color: #f0ad4e;\n  background: #fffbf0;\n}\n.verify-hint[_ngcontent-%COMP%] {\n  display: block;\n  margin: -2px 0 6px;\n  color: #8a5a00;\n  font-size: 12px;\n  font-weight: 600;\n}\n.verified-check[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 0 0 16px;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.client-checks[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  max-height: 180px;\n  overflow-y: auto;\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n}\n.form-group[_ngcontent-%COMP%]   label.client-check[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 0;\n  font-weight: 400;\n}\n.hint[_ngcontent-%COMP%] {\n  display: block;\n  margin: -4px 0 6px;\n  color: #95a5a6;\n  font-size: 11px;\n}\n.form-group[_ngcontent-%COMP%]   label.checkbox-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.pdf-section[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  padding: 20px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}\n.pdf-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 14px 0;\n  color: #2c3e50;\n  font-size: 16px;\n}\n.pdf-current[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 14px;\n  padding: 12px;\n  background: #fff;\n  border-radius: 6px;\n}\n.pdf-current[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.pdf-upload[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.btn-danger[_ngcontent-%COMP%] {\n  background: #e74c3c;\n  color: white;\n}\n.btn-danger[_ngcontent-%COMP%]:hover {\n  background: #c0392b;\n}\n.form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding-top: 24px;\n  border-top: 1px solid #eee;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  background: #bdc3c7;\n  cursor: not-allowed;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n  color: white;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n@media (max-width: 768px) {\n  .form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=card-form.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardFormComponent, { className: "CardFormComponent", filePath: "src\\app\\features\\safety-cards\\components\\card-form.component.ts", lineNumber: 18 });
})();
export {
  CardFormComponent
};
//# sourceMappingURL=chunk-2HKCNOXR.js.map
