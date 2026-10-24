import {
  SdsValueComponent
} from "./chunk-UHSYZGYX.js";
import {
  SDS_FIELDS,
  columnLabel,
  fieldLabel,
  isToVerify,
  verifyReasons
} from "./chunk-SBOVXDKA.js";
import {
  SafetyCardService
} from "./chunk-V6DBU5ZR.js";
import "./chunk-26ID2PJJ.js";
import {
  ClientService
} from "./chunk-2ZRWPK2W.js";
import {
  RouterLink
} from "./chunk-NBCZAAC7.js";
import {
  CommonModule,
  DatePipe,
  NgClass,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YE2GV6RL.js";

// src/app/features/safety-cards/components/card-list.component.ts
var _c0 = (a0) => ["/safety-cards", a0, "edit"];
function CardListComponent_option_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 26);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r1 = ctx.$implicit;
    \u0275\u0275property("value", c_r1.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", c_r1.id, " \u2013 ", c_r1.ragioneSociale, "");
  }
}
function CardListComponent_th_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r2 = ctx.$implicit;
    const i_r3 = ctx.index;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275classMap("col-" + f_r2.kind);
    \u0275\u0275classProp("sticky-1", i_r3 === 0)("sticky-2", i_r3 === 1);
    \u0275\u0275property("title", f_r2.hint || "");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r3.columnLabel(f_r2));
  }
}
function CardListComponent_tr_47_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 28);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275attribute("colspan", ctx_r3.fields.length + 1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r3.isLoading ? "Caricamento..." : "Nessuna scheda trovata", " ");
  }
}
function CardListComponent_tr_48_td_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "td")(1, "app-sds-value", 35);
    \u0275\u0275listener("openPdf", function CardListComponent_tr_48_td_1_Template_app_sds_value_openPdf_1_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.openPdf($event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const f_r8 = ctx.$implicit;
    const i_r9 = ctx.index;
    const card_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275classMap("col-" + f_r8.kind);
    \u0275\u0275classProp("sticky-1", i_r9 === 0)("sticky-2", i_r9 === 1)("cell-verify", ctx_r3.isToVerify(card_r6, f_r8.key));
    \u0275\u0275advance();
    \u0275\u0275property("card", card_r6)("field", f_r8);
  }
}
function CardListComponent_tr_48_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 29);
    \u0275\u0275listener("click", function CardListComponent_tr_48_Template_tr_click_0_listener() {
      const card_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openDetail(card_r6));
    });
    \u0275\u0275template(1, CardListComponent_tr_48_td_1_Template, 2, 10, "td", 30);
    \u0275\u0275elementStart(2, "td", 31);
    \u0275\u0275listener("click", function CardListComponent_tr_48_Template_td_click_2_listener($event) {
      \u0275\u0275restoreView(_r5);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(3, "div", 32)(4, "a", 33);
    \u0275\u0275text(5, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 34);
    \u0275\u0275listener("click", function CardListComponent_tr_48_Template_button_click_6_listener() {
      const card_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onDelete(card_r6.id));
    });
    \u0275\u0275text(7, "Elimina");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const card_r6 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275classProp("row-verify", card_r6.campiDaVerificare == null ? null : card_r6.campiDaVerificare.length);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r3.fields);
    \u0275\u0275advance(3);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(4, _c0, card_r6.id));
  }
}
function CardListComponent_div_49_div_13_li_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li")(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const k_r11 = ctx.$implicit;
    const c_r12 = \u0275\u0275nextContext(2).ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.fieldLabel(k_r11));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(": ", ctx_r3.verifyReasons(c_r12, k_r11).join("; "), "");
  }
}
function CardListComponent_div_49_div_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 58)(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4, 'Questi dati non sono stati ritrovati nel testo della SDS e non sono stati inseriti (o sono stati inseriti in parte). Controllali sul PDF e completali da "Modifica".');
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "ul");
    \u0275\u0275template(6, CardListComponent_div_49_div_13_li_6_Template, 4, 2, "li", 59);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const c_r12 = \u0275\u0275nextContext().ngIf;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("\u26A0 ", c_r12.campiDaVerificare.length, " ", c_r12.campiDaVerificare.length === 1 ? "campo da verificare" : "campi da verificare", " sulla scheda PDF");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", c_r12.campiDaVerificare);
  }
}
function CardListComponent_div_49_div_17_small_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small", 62);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(f_r14.hint);
  }
}
function CardListComponent_div_49_div_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 47)(1, "label");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275template(3, CardListComponent_div_49_div_17_small_3_Template, 2, 1, "small", 60);
    \u0275\u0275elementStart(4, "div", 48)(5, "app-sds-value", 61);
    \u0275\u0275listener("openPdf", function CardListComponent_div_49_div_17_Template_app_sds_value_openPdf_5_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.openPdf($event));
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const f_r14 = ctx.$implicit;
    const c_r12 = \u0275\u0275nextContext().ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275classProp("full-width", ctx_r3.isWide(f_r14))("item-verify", ctx_r3.isToVerify(c_r12, f_r14.key));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.columnLabel(f_r14));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", f_r14.hint);
    \u0275\u0275advance(2);
    \u0275\u0275property("card", c_r12)("field", f_r14);
  }
}
function CardListComponent_div_49_span_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 63);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r12 = \u0275\u0275nextContext().ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("ngClass", ctx_r3.getDaysClass(c_r12.daysRemaining));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" (", c_r12.daysRemaining, " giorni)");
  }
}
function CardListComponent_div_49_span_62_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Dati estratti automaticamente dal PDF \xB7 ");
    \u0275\u0275elementEnd();
  }
}
function CardListComponent_div_49_button_65_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 64);
    \u0275\u0275listener("click", function CardListComponent_div_49_button_65_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r15);
      const c_r12 = \u0275\u0275nextContext().ngIf;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openPdf(c_r12));
    });
    \u0275\u0275text(1, "Apri PDF");
    \u0275\u0275elementEnd();
  }
}
function CardListComponent_div_49_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36);
    \u0275\u0275listener("click", function CardListComponent_div_49_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeDetail());
    });
    \u0275\u0275elementStart(1, "div", 37);
    \u0275\u0275listener("click", function CardListComponent_div_49_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r10);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 38)(3, "div")(4, "h2");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 39);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 40);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "button", 41);
    \u0275\u0275listener("click", function CardListComponent_div_49_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeDetail());
    });
    \u0275\u0275text(11, "\xD7");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 42);
    \u0275\u0275template(13, CardListComponent_div_49_div_13_Template, 7, 3, "div", 43);
    \u0275\u0275elementStart(14, "h3");
    \u0275\u0275text(15, "Dati da estrapolare");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 44);
    \u0275\u0275template(17, CardListComponent_div_49_div_17_Template, 6, 8, "div", 45);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 46)(19, "h3");
    \u0275\u0275text(20, "Gestione scheda");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 44)(22, "div", 47)(23, "label");
    \u0275\u0275text(24, "Tipologia");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "div", 48);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "div", 47)(28, "label");
    \u0275\u0275text(29, "Versione / Revisione SDS");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "div", 48);
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "div", 47)(33, "label");
    \u0275\u0275text(34, "Data Scadenza");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "div", 48);
    \u0275\u0275text(36);
    \u0275\u0275pipe(37, "date");
    \u0275\u0275template(38, CardListComponent_div_49_span_38_Template, 2, 2, "span", 49);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(39, "div", 47)(40, "label");
    \u0275\u0275text(41, "Stato");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "div", 48)(43, "span", 50);
    \u0275\u0275text(44);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(45, "div", 47)(46, "label");
    \u0275\u0275text(47, "Validit\xE0 (mesi)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(48, "div", 48);
    \u0275\u0275text(49);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(50, "div", 47)(51, "label");
    \u0275\u0275text(52, "Frequenza Controllo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(53, "div", 48);
    \u0275\u0275text(54);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(55, "div", 51)(56, "label");
    \u0275\u0275text(57, "Osservazioni");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(58, "div", 52);
    \u0275\u0275text(59);
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(60, "div", 53)(61, "span", 54);
    \u0275\u0275template(62, CardListComponent_div_49_span_62_Template, 2, 0, "span", 23);
    \u0275\u0275text(63);
    \u0275\u0275pipe(64, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275template(65, CardListComponent_div_49_button_65_Template, 2, 0, "button", 55);
    \u0275\u0275elementStart(66, "a", 56);
    \u0275\u0275text(67, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(68, "button", 57);
    \u0275\u0275listener("click", function CardListComponent_div_49_Template_button_click_68_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeDetail());
    });
    \u0275\u0275text(69, "Chiudi");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_16_0;
    const c_r12 = ctx.ngIf;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(c_r12.titolo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r3.clientNames(c_r12) || "Solo archivio (nessun cliente)", " \xB7 ", c_r12.tipologia, "");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r3.getStatusClass(c_r12.stato));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(c_r12.stato);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", c_r12.campiDaVerificare == null ? null : c_r12.campiDaVerificare.length);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r3.fields);
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(c_r12.tipologia || "-");
    \u0275\u0275advance();
    \u0275\u0275classProp("item-verify", ctx_r3.isToVerify(c_r12, "numeroProtocollo"));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(c_r12.numeroProtocollo || "-");
    \u0275\u0275advance();
    \u0275\u0275classProp("item-verify", ctx_r3.isToVerify(c_r12, "dataScadenza"));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind2(37, 24, c_r12.dataScadenza, "dd/MM/yyyy") || "-", " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", c_r12.daysRemaining !== null && c_r12.daysRemaining !== void 0);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngClass", ctx_r3.getStatusClass(c_r12.stato));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(c_r12.stato);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate((tmp_16_0 = c_r12.validitaMesi) !== null && tmp_16_0 !== void 0 ? tmp_16_0 : "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(c_r12.frequenzaControllo || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(c_r12.osservazioni || "-");
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", c_r12.llmAnalyzed);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Aggiornata il ", \u0275\u0275pipeBind2(64, 27, c_r12.updatedAt, "dd/MM/yyyy HH:mm"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", c_r12.hasPdf && c_r12.pdfUrl);
    \u0275\u0275advance();
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(30, _c0, c_r12.id));
  }
}
var CardListComponent = class _CardListComponent {
  cardService;
  clientService;
  columnLabel = columnLabel;
  isToVerify = isToVerify;
  verifyReasons = verifyReasons;
  fieldLabel = fieldLabel;
  onlyToVerify = false;
  get toVerifyCount() {
    return this.cards.filter((c) => c.campiDaVerificare?.length).length;
  }
  onOnlyToVerifyChange(event) {
    this.onlyToVerify = event.target.checked;
    this.applyFilters();
  }
  fields = SDS_FIELDS;
  cards = [];
  filteredCards = [];
  isLoading = true;
  selectedTipologia = "";
  selectedStato = "";
  selectedClientId = 0;
  searchTerm = "";
  clients = [];
  selectedCard = null;
  constructor(cardService, clientService) {
    this.cardService = cardService;
    this.clientService = clientService;
  }
  ngOnInit() {
    this.loadCards();
    this.clientService.getAll().subscribe({
      next: (clients) => this.clients = clients,
      error: () => {
      }
    });
  }
  loadCards() {
    this.isLoading = true;
    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert("Errore nel caricamento delle schede");
      }
    });
  }
  onTipologiaChange(event) {
    this.selectedTipologia = event.target.value;
    this.applyFilters();
  }
  onStatoChange(event) {
    this.selectedStato = event.target.value;
    this.applyFilters();
  }
  onSearch(event) {
    this.searchTerm = event.target.value.trim().toLowerCase();
    this.applyFilters();
  }
  onClientChange(event) {
    const value = event.target.value;
    this.selectedClientId = value ? Number(value) : 0;
    this.applyFilters();
  }
  applyFilters() {
    this.filteredCards = this.cards.filter((card) => {
      const matchTipologia = !this.selectedTipologia || card.tipologia === this.selectedTipologia;
      const matchStato = !this.selectedStato || card.stato === this.selectedStato;
      const matchClient = !this.selectedClientId || (this.selectedClientId === -1 ? card.clients.length === 0 : card.clients.some((c) => c.id === this.selectedClientId));
      const matchSearch = !this.searchTerm || [
        card.titolo,
        card.enteEmittitore,
        card.frasiH,
        card.pittogrammi,
        card.composizione,
        card.nomeFileImportato,
        card.composizioneCasSopra,
        card.composizioneCasSotto,
        ...card.clients.map((c) => c.ragioneSociale)
      ].some((v) => v?.toLowerCase().includes(this.searchTerm));
      const matchVerify = !this.onlyToVerify || !!card.campiDaVerificare?.length;
      return matchTipologia && matchStato && matchClient && matchSearch && matchVerify;
    });
  }
  openPdf(card) {
    this.cardService.openPdf(card);
  }
  clientNames(card) {
    return card.clients.map((c) => c.ragioneSociale).join(", ");
  }
  openDetail(card) {
    this.selectedCard = card;
  }
  closeDetail() {
    this.selectedCard = null;
  }
  onEscape() {
    this.closeDetail();
  }
  isWide(field) {
    return field.kind === "hcodes";
  }
  getStatusClass(status) {
    switch (status) {
      case "Valid":
        return "badge-valid";
      case "Expiring":
        return "badge-expiring";
      case "Expired":
        return "badge-expired";
      default:
        return "badge-default";
    }
  }
  getDaysClass(days) {
    if (days === void 0 || days === null)
      return "";
    if (days < 0)
      return "days-danger";
    if (days <= 30)
      return "days-warning";
    return "days-positive";
  }
  onDelete(id) {
    if (confirm("Sei sicuro di voler eliminare questa scheda?")) {
      this.cardService.deleteCard(id).subscribe({
        next: () => {
          alert("Scheda eliminata con successo");
          this.loadCards();
        },
        error: () => {
          alert("Errore nell'eliminazione della scheda");
        }
      });
    }
  }
  static \u0275fac = function CardListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardListComponent)(\u0275\u0275directiveInject(SafetyCardService), \u0275\u0275directiveInject(ClientService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardListComponent, selectors: [["app-card-list"]], hostBindings: function CardListComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown.escape", function CardListComponent_keydown_escape_HostBindingHandler() {
        return ctx.onEscape();
      }, false, \u0275\u0275resolveDocument);
    }
  }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 50, vars: 6, consts: [[1, "card-list-page"], [1, "page-header"], ["routerLink", "/safety-cards/new", 1, "btn", "btn-primary"], [1, "filters"], ["type", "text", "placeholder", "Cerca prodotto, produttore, frasi H, CAS...", 1, "filter-select", "search-input", 3, "input"], [1, "filter-select", 3, "change"], ["value", ""], ["value", "-1"], [3, "value", 4, "ngFor", "ngForOf"], ["value", "SDS"], ["value", "DPI"], ["value", "Antincendio"], ["value", "Rischi"], ["value", "Altro"], ["value", "Valid"], ["value", "Expiring"], ["value", "Expired"], [1, "verify-filter"], ["type", "checkbox", 3, "change"], [1, "table-container"], [1, "data-table"], [3, "class", "sticky-1", "sticky-2", "title", 4, "ngFor", "ngForOf"], [1, "col-actions"], [4, "ngIf"], ["class", "clickable-row", "title", "Clicca per vedere tutti i dati", 3, "row-verify", "click", 4, "ngFor", "ngForOf"], ["class", "detail-overlay", 3, "click", 4, "ngIf"], [3, "value"], [3, "title"], [1, "text-center"], ["title", "Clicca per vedere tutti i dati", 1, "clickable-row", 3, "click"], [3, "class", "sticky-1", "sticky-2", "cell-verify", 4, "ngFor", "ngForOf"], [1, "col-actions", 3, "click"], [1, "actions"], [1, "btn", "btn-small", "btn-secondary", 3, "routerLink"], [1, "btn", "btn-small", "btn-danger", 3, "click"], ["mode", "cell", 3, "openPdf", "card", "field"], [1, "detail-overlay", 3, "click"], ["role", "dialog", "aria-modal", "true", 1, "detail-card", 3, "click"], [1, "detail-header"], [1, "detail-sub"], [1, "badge", "ms-2", 3, "ngClass"], ["type", "button", "aria-label", "Chiudi", 1, "close-btn", 3, "click"], [1, "detail-body"], ["class", "verify-banner", 4, "ngIf"], [1, "detail-grid"], ["class", "detail-item", 3, "full-width", "item-verify", 4, "ngFor", "ngForOf"], [1, "detail-section"], [1, "detail-item"], [1, "detail-value"], [3, "ngClass", 4, "ngIf"], [1, "badge", 3, "ngClass"], [1, "detail-item", "full-width"], [1, "detail-value", "pre-wrap"], [1, "detail-actions"], [1, "detail-meta"], ["type", "button", "class", "btn btn-small btn-outline", 3, "click", 4, "ngIf"], [1, "btn", "btn-small", "btn-primary", 3, "routerLink"], ["type", "button", 1, "btn", "btn-small", "btn-secondary", 3, "click"], [1, "verify-banner"], [4, "ngFor", "ngForOf"], ["class", "hint", 4, "ngIf"], ["mode", "detail", 3, "openPdf", "card", "field"], [1, "hint"], [3, "ngClass"], ["type", "button", 1, "btn", "btn-small", "btn-outline", 3, "click"]], template: function CardListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3, "Schede di Sicurezza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 2);
      \u0275\u0275text(5, "+ Nuova Scheda");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 3)(7, "input", 4);
      \u0275\u0275listener("input", function CardListComponent_Template_input_input_7_listener($event) {
        return ctx.onSearch($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "select", 5);
      \u0275\u0275listener("change", function CardListComponent_Template_select_change_8_listener($event) {
        return ctx.onClientChange($event);
      });
      \u0275\u0275elementStart(9, "option", 6);
      \u0275\u0275text(10, "Tutti i clienti");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "option", 7);
      \u0275\u0275text(12, "Solo archivio (senza clienti)");
      \u0275\u0275elementEnd();
      \u0275\u0275template(13, CardListComponent_option_13_Template, 2, 3, "option", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "select", 5);
      \u0275\u0275listener("change", function CardListComponent_Template_select_change_14_listener($event) {
        return ctx.onTipologiaChange($event);
      });
      \u0275\u0275elementStart(15, "option", 6);
      \u0275\u0275text(16, "Tutte le tipologie");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "option", 9);
      \u0275\u0275text(18, "Scheda di Sicurezza (SDS)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "option", 10);
      \u0275\u0275text(20, "DPI");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "option", 11);
      \u0275\u0275text(22, "Antincendio");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "option", 12);
      \u0275\u0275text(24, "Valutazione Rischi");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "option", 13);
      \u0275\u0275text(26, "Altro");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(27, "select", 5);
      \u0275\u0275listener("change", function CardListComponent_Template_select_change_27_listener($event) {
        return ctx.onStatoChange($event);
      });
      \u0275\u0275elementStart(28, "option", 6);
      \u0275\u0275text(29, "Tutti gli stati");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "option", 14);
      \u0275\u0275text(31, "Valida");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "option", 15);
      \u0275\u0275text(33, "In scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "option", 16);
      \u0275\u0275text(35, "Scaduta");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(36, "label", 17)(37, "input", 18);
      \u0275\u0275listener("change", function CardListComponent_Template_input_change_37_listener($event) {
        return ctx.onOnlyToVerifyChange($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(38);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(39, "div", 19)(40, "table", 20)(41, "thead")(42, "tr");
      \u0275\u0275template(43, CardListComponent_th_43_Template, 2, 8, "th", 21);
      \u0275\u0275elementStart(44, "th", 22);
      \u0275\u0275text(45, "Azioni");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(46, "tbody");
      \u0275\u0275template(47, CardListComponent_tr_47_Template, 3, 2, "tr", 23)(48, CardListComponent_tr_48_Template, 8, 6, "tr", 24);
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(49, CardListComponent_div_49_Template, 70, 32, "div", 25);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(13);
      \u0275\u0275property("ngForOf", ctx.clients);
      \u0275\u0275advance(25);
      \u0275\u0275textInterpolate1(" Solo da verificare (", ctx.toVerifyCount, ") ");
      \u0275\u0275advance(5);
      \u0275\u0275property("ngForOf", ctx.fields);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.filteredCards.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngForOf", ctx.filteredCards);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.selectedCard);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, DatePipe, RouterLink, SdsValueComponent], styles: ["\n\n.card-list-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 20px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.filters[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  margin-bottom: 16px;\n}\n.filter-select[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.search-input[_ngcontent-%COMP%] {\n  min-width: 300px;\n}\n.table-container[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  background: white;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.data-table[_ngcontent-%COMP%] {\n  width: max-content;\n  min-width: 100%;\n  border-collapse: separate;\n  border-spacing: 0;\n  font-size: 14px;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.data-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 10px;\n  text-align: left;\n  vertical-align: top;\n  border-bottom: 1px solid #eee;\n  background: white;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  font-weight: 600;\n  color: #2c3e50;\n  font-size: 13px;\n  vertical-align: bottom;\n  cursor: help;\n}\n.col-client[_ngcontent-%COMP%] {\n  min-width: 110px;\n  max-width: 150px;\n}\n.col-text[_ngcontent-%COMP%] {\n  min-width: 110px;\n  max-width: 170px;\n}\n.col-hcodes[_ngcontent-%COMP%] {\n  min-width: 170px;\n  max-width: 220px;\n}\n.col-ghs[_ngcontent-%COMP%] {\n  min-width: 150px;\n  max-width: 200px;\n}\n.col-cas[_ngcontent-%COMP%] {\n  min-width: 120px;\n  max-width: 160px;\n}\n.col-names[_ngcontent-%COMP%] {\n  min-width: 180px;\n  max-width: 240px;\n}\n.col-teb[_ngcontent-%COMP%], \n.col-density[_ngcontent-%COMP%] {\n  min-width: 90px;\n  white-space: nowrap;\n}\n.col-file[_ngcontent-%COMP%] {\n  min-width: 140px;\n  max-width: 200px;\n}\n.col-bool[_ngcontent-%COMP%] {\n  min-width: 90px;\n}\n.col-url[_ngcontent-%COMP%] {\n  min-width: 100px;\n  max-width: 160px;\n}\n.col-date[_ngcontent-%COMP%] {\n  min-width: 95px;\n  white-space: nowrap;\n}\n.col-actions[_ngcontent-%COMP%] {\n  min-width: 90px;\n}\n.sticky-1[_ngcontent-%COMP%] {\n  position: sticky;\n  left: 0;\n  z-index: 2;\n  width: 130px;\n  min-width: 130px;\n  max-width: 130px;\n}\n.sticky-2[_ngcontent-%COMP%] {\n  position: sticky;\n  left: 130px;\n  z-index: 2;\n  box-shadow: 2px 0 0 #eee;\n  min-width: 170px;\n  max-width: 170px;\n}\nth.sticky-1[_ngcontent-%COMP%], \nth.sticky-2[_ngcontent-%COMP%] {\n  z-index: 3;\n}\n.text-center[_ngcontent-%COMP%] {\n  text-align: center !important;\n  color: #999;\n}\n.clickable-row[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.row-verify[_ngcontent-%COMP%]   td.sticky-1[_ngcontent-%COMP%] {\n  box-shadow: inset 4px 0 0 #f0ad4e;\n}\n.data-table[_ngcontent-%COMP%]   td.cell-verify[_ngcontent-%COMP%] {\n  background: #fff8e6;\n}\n.verify-filter[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 14px;\n  color: #8a5a00;\n}\n.verify-banner[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n  padding: 12px 16px;\n  border: 1px solid #f0c36d;\n  border-radius: 6px;\n  background: #fff8e6;\n  color: #6b4a00;\n  font-size: 13px;\n}\n.verify-banner[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 4px 0 6px;\n}\n.verify-banner[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 18px;\n}\n.item-verify[_ngcontent-%COMP%]   .detail-value[_ngcontent-%COMP%] {\n  border-color: #f0c36d;\n  background: #fff8e6;\n}\n.clickable-row[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%] {\n  background: #f5f9fd;\n}\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 600;\n  background: #eceff1;\n  color: #455a64;\n}\n.badge-valid[_ngcontent-%COMP%] {\n  background: #d4edda;\n  color: #155724;\n}\n.badge-expiring[_ngcontent-%COMP%] {\n  background: #fff3cd;\n  color: #856404;\n}\n.badge-expired[_ngcontent-%COMP%] {\n  background: #f8d7da;\n  color: #721c24;\n}\n.days-positive[_ngcontent-%COMP%] {\n  color: #27ae60;\n  font-weight: 600;\n}\n.days-warning[_ngcontent-%COMP%] {\n  color: #f39c12;\n  font-weight: 600;\n}\n.days-danger[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-weight: 600;\n}\n.actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n  color: white;\n}\n.btn-small[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  font-size: 12px;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n.btn-danger[_ngcontent-%COMP%] {\n  background: #e74c3c;\n}\n.btn-danger[_ngcontent-%COMP%]:hover {\n  background: #c0392b;\n}\n.btn-outline[_ngcontent-%COMP%] {\n  background: white;\n  color: #3498db;\n  border: 1px solid #3498db;\n}\n.btn-outline[_ngcontent-%COMP%]:hover {\n  background: #eaf4fc;\n}\n.detail-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.45);\n  display: flex;\n  align-items: flex-start;\n  justify-content: center;\n  padding: 40px 16px;\n  overflow-y: auto;\n  z-index: 1050;\n}\n.detail-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  width: 100%;\n  max-width: 960px;\n  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);\n}\n.detail-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 16px;\n  padding: 24px 32px 16px;\n  border-bottom: 1px solid #eee;\n}\n.detail-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 6px;\n  color: #2c3e50;\n  font-size: 22px;\n  overflow-wrap: break-word;\n}\n.detail-sub[_ngcontent-%COMP%] {\n  color: #7f8c8d;\n  font-size: 14px;\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 28px;\n  line-height: 1;\n  color: #95a5a6;\n  cursor: pointer;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  color: #2c3e50;\n}\n.detail-body[_ngcontent-%COMP%] {\n  padding: 20px 32px;\n}\n.detail-body[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 16px;\n  font-size: 16px;\n  color: #2c3e50;\n}\n.detail-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 16px 20px;\n}\n.detail-item[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.detail-item.full-width[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n}\n.detail-item[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  font-weight: 600;\n  color: #2c3e50;\n  font-size: 13px;\n}\n.hint[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 4px;\n  color: #95a5a6;\n  font-size: 11px;\n}\n.detail-value[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  padding: 8px 12px;\n  min-height: 38px;\n  background: #f8f9fa;\n  border: 1px solid #eee;\n  border-radius: 4px;\n  font-size: 14px;\n  overflow-wrap: break-word;\n}\n.pre-wrap[_ngcontent-%COMP%] {\n  white-space: pre-wrap;\n}\n.detail-section[_ngcontent-%COMP%] {\n  margin-top: 24px;\n  padding: 20px;\n  border: 1px solid #e1e8ed;\n  border-radius: 8px;\n}\n.detail-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 10px;\n  padding: 16px 32px 24px;\n  border-top: 1px solid #eee;\n}\n.detail-meta[_ngcontent-%COMP%] {\n  margin-right: auto;\n  color: #95a5a6;\n  font-size: 12px;\n}\n@media (max-width: 768px) {\n  .detail-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .detail-header[_ngcontent-%COMP%], \n   .detail-body[_ngcontent-%COMP%], \n   .detail-actions[_ngcontent-%COMP%] {\n    padding-left: 16px;\n    padding-right: 16px;\n  }\n  .sticky-1[_ngcontent-%COMP%], \n   .sticky-2[_ngcontent-%COMP%] {\n    position: static;\n    box-shadow: none;\n  }\n}\n/*# sourceMappingURL=card-list.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardListComponent, { className: "CardListComponent", filePath: "src\\app\\features\\safety-cards\\components\\card-list.component.ts", lineNumber: 367 });
})();
export {
  CardListComponent
};
//# sourceMappingURL=chunk-FW2GNGOG.js.map
