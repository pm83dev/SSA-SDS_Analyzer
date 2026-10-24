import {
  SafetyCardService
} from "./chunk-YV7K3B3X.js";
import "./chunk-PX24KK2F.js";
import {
  ClientService
} from "./chunk-PB6NFXHV.js";
import {
  Router,
  RouterLink
} from "./chunk-U3ABJN4X.js";
import {
  CommonModule,
  DatePipe,
  HttpClient,
  NgClass,
  NgForOf,
  NgIf,
  environment,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
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
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-HDSUHL5P.js";

// src/app/features/safety-cards/components/card-list.component.ts
var _c0 = (a0) => ["/safety-cards", a0, "edit"];
function CardListComponent_option_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r1 = ctx.$implicit;
    \u0275\u0275property("value", c_r1.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(c_r1.ragioneSociale);
  }
}
function CardListComponent_tr_63_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 21);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.isLoading ? "Caricamento..." : "Nessuna scheda trovata", " ");
  }
}
function CardListComponent_tr_64_span_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 31);
    \u0275\u0275text(1, "Diisocianati");
    \u0275\u0275elementEnd();
  }
}
function CardListComponent_tr_64_span_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 32);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const card_r4 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("ngClass", ctx_r1.getDaysClass(card_r4.daysRemaining));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(card_r4.daysRemaining);
  }
}
function CardListComponent_tr_64_span_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
function CardListComponent_tr_64_a_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "a", 33);
    \u0275\u0275listener("click", function CardListComponent_tr_64_a_27_Template_a_click_0_listener($event) {
      \u0275\u0275restoreView(_r5);
      const card_r4 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      $event.preventDefault();
      return \u0275\u0275resetView(ctx_r1.openPdf(card_r4));
    });
    \u0275\u0275text(1, "PDF");
    \u0275\u0275elementEnd();
  }
}
function CardListComponent_tr_64_span_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 34);
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
function CardListComponent_tr_64_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "td");
    \u0275\u0275text(6);
    \u0275\u0275template(7, CardListComponent_tr_64_span_7_Template, 2, 0, "span", 22);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "td");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "td", 23);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "td", 23);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "td");
    \u0275\u0275text(15);
    \u0275\u0275pipe(16, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "td");
    \u0275\u0275text(18);
    \u0275\u0275pipe(19, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "td");
    \u0275\u0275template(21, CardListComponent_tr_64_span_21_Template, 2, 2, "span", 24)(22, CardListComponent_tr_64_span_22_Template, 2, 0, "span", 18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "td")(24, "span", 25);
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "td");
    \u0275\u0275template(27, CardListComponent_tr_64_a_27_Template, 2, 0, "a", 26)(28, CardListComponent_tr_64_span_28_Template, 2, 0, "span", 27);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "td", 28)(30, "a", 29);
    \u0275\u0275text(31, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "button", 30);
    \u0275\u0275listener("click", function CardListComponent_tr_64_Template_button_click_32_listener() {
      const card_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onDelete(card_r4.id));
    });
    \u0275\u0275text(33, "Elimina");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const card_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r4.clientName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r4.tipologia);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", card_r4.titolo, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", card_r4.contieneDiisocianati);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r4.enteEmittitore || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r4.frasiH || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r4.pittogrammi || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(16, 16, card_r4.dataRilascio, "dd/MM/yyyy"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(19, 19, card_r4.dataScadenza, "dd/MM/yyyy"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", card_r4.daysRemaining !== null && card_r4.daysRemaining !== void 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", card_r4.daysRemaining === null || card_r4.daysRemaining === void 0);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", ctx_r1.getStatusClass(card_r4.stato));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(card_r4.stato);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", card_r4.hasPdf && card_r4.pdfUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !card_r4.hasPdf);
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(22, _c0, card_r4.id));
  }
}
var CardListComponent = class _CardListComponent {
  cardService;
  clientService;
  router;
  http;
  cards = [];
  filteredCards = [];
  isLoading = true;
  selectedTipologia = "";
  selectedStato = "";
  selectedClientId = 0;
  searchTerm = "";
  clients = [];
  constructor(cardService, clientService, router, http) {
    this.cardService = cardService;
    this.clientService = clientService;
    this.router = router;
    this.http = http;
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
  // Il PDF è servito da un endpoint protetto: un semplice <a href> non invia il token
  openPdf(card) {
    if (!card.pdfUrl)
      return;
    this.http.get(`${environment.apiUrl}${card.pdfUrl}`, { responseType: "blob" }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 6e4);
      },
      error: () => alert("Errore nell'apertura del PDF")
    });
  }
  applyFilters() {
    this.filteredCards = this.cards.filter((card) => {
      const matchTipologia = !this.selectedTipologia || card.tipologia === this.selectedTipologia;
      const matchStato = !this.selectedStato || card.stato === this.selectedStato;
      const matchClient = !this.selectedClientId || card.clientId === this.selectedClientId;
      const matchSearch = !this.searchTerm || [card.titolo, card.enteEmittitore, card.frasiH, card.pittogrammi, card.composizione, card.clientName].some((v) => v?.toLowerCase().includes(this.searchTerm));
      return matchTipologia && matchStato && matchClient && matchSearch;
    });
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
    return new (__ngFactoryType__ || _CardListComponent)(\u0275\u0275directiveInject(SafetyCardService), \u0275\u0275directiveInject(ClientService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(HttpClient));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardListComponent, selectors: [["app-card-list"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 65, vars: 3, consts: [[1, "card-list-page"], [1, "page-header"], ["routerLink", "/safety-cards/new", 1, "btn", "btn-primary"], [1, "filters"], ["type", "text", "placeholder", "Cerca prodotto, produttore, frasi H...", 1, "filter-select", "search-input", 3, "input"], [1, "filter-select", 3, "change"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["value", "SDS"], ["value", "DPI"], ["value", "Antincendio"], ["value", "Rischi"], ["value", "Altro"], ["value", "Valid"], ["value", "Expiring"], ["value", "Expired"], [1, "table-container"], [1, "data-table"], [4, "ngIf"], [4, "ngFor", "ngForOf"], [3, "value"], ["colspan", "12", 1, "text-center"], ["class", "badge badge-expiring", "title", "Contiene diisocianati", 4, "ngIf"], [1, "small-text"], [3, "ngClass", 4, "ngIf"], [1, "badge", 3, "ngClass"], ["href", "#", "class", "pdf-link", 3, "click", 4, "ngIf"], ["class", "no-pdf", 4, "ngIf"], [1, "actions"], [1, "btn", "btn-small", "btn-secondary", 3, "routerLink"], [1, "btn", "btn-small", "btn-danger", 3, "click"], ["title", "Contiene diisocianati", 1, "badge", "badge-expiring"], [3, "ngClass"], ["href", "#", 1, "pdf-link", 3, "click"], [1, "no-pdf"]], template: function CardListComponent_Template(rf, ctx) {
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
      \u0275\u0275template(11, CardListComponent_option_11_Template, 2, 2, "option", 7);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "select", 5);
      \u0275\u0275listener("change", function CardListComponent_Template_select_change_12_listener($event) {
        return ctx.onTipologiaChange($event);
      });
      \u0275\u0275elementStart(13, "option", 6);
      \u0275\u0275text(14, "Tutte le tipologie");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "option", 8);
      \u0275\u0275text(16, "Scheda di Sicurezza (SDS)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "option", 9);
      \u0275\u0275text(18, "DPI");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "option", 10);
      \u0275\u0275text(20, "Antincendio");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "option", 11);
      \u0275\u0275text(22, "Valutazione Rischi");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "option", 12);
      \u0275\u0275text(24, "Altro");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "select", 5);
      \u0275\u0275listener("change", function CardListComponent_Template_select_change_25_listener($event) {
        return ctx.onStatoChange($event);
      });
      \u0275\u0275elementStart(26, "option", 6);
      \u0275\u0275text(27, "Tutti gli stati");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "option", 13);
      \u0275\u0275text(29, "Valida");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "option", 14);
      \u0275\u0275text(31, "In scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "option", 15);
      \u0275\u0275text(33, "Scaduta");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(34, "div", 16)(35, "table", 17)(36, "thead")(37, "tr")(38, "th");
      \u0275\u0275text(39, "Cliente");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "th");
      \u0275\u0275text(41, "Tipologia");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "th");
      \u0275\u0275text(43, "Titolo / Prodotto");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "th");
      \u0275\u0275text(45, "Produttore");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "th");
      \u0275\u0275text(47, "Frasi H");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "th");
      \u0275\u0275text(49, "Pittogrammi");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "th");
      \u0275\u0275text(51, "Data Rilascio / SDS");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "th");
      \u0275\u0275text(53, "Data Scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "th");
      \u0275\u0275text(55, "Giorni");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "th");
      \u0275\u0275text(57, "Stato");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "th");
      \u0275\u0275text(59, "PDF");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(60, "th");
      \u0275\u0275text(61, "Azioni");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(62, "tbody");
      \u0275\u0275template(63, CardListComponent_tr_63_Template, 3, 1, "tr", 18)(64, CardListComponent_tr_64_Template, 34, 24, "tr", 19);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(11);
      \u0275\u0275property("ngForOf", ctx.clients);
      \u0275\u0275advance(52);
      \u0275\u0275property("ngIf", ctx.filteredCards.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngForOf", ctx.filteredCards);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, DatePipe, RouterLink], styles: ["\n\n.card-list-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 20px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.filters[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  margin-bottom: 16px;\n}\n.filter-select[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.search-input[_ngcontent-%COMP%] {\n  min-width: 280px;\n}\n.small-text[_ngcontent-%COMP%] {\n  font-size: 12px;\n  max-width: 220px;\n}\n.table-container[_ngcontent-%COMP%] {\n  overflow-x: auto;\n}\n.data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  background: white;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.data-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  text-align: left;\n  border-bottom: 1px solid #eee;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.text-center[_ngcontent-%COMP%] {\n  text-align: center !important;\n  color: #999;\n}\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 600;\n}\n.badge-valid[_ngcontent-%COMP%] {\n  background: #d4edda;\n  color: #155724;\n}\n.badge-expiring[_ngcontent-%COMP%] {\n  background: #fff3cd;\n  color: #856404;\n}\n.badge-expired[_ngcontent-%COMP%] {\n  background: #f8d7da;\n  color: #721c24;\n}\n.days-positive[_ngcontent-%COMP%] {\n  color: #27ae60;\n  font-weight: 600;\n}\n.days-warning[_ngcontent-%COMP%] {\n  color: #f39c12;\n  font-weight: 600;\n}\n.days-danger[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-weight: 600;\n}\n.pdf-link[_ngcontent-%COMP%] {\n  color: #3498db;\n  text-decoration: underline;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 13px;\n}\n.no-pdf[_ngcontent-%COMP%] {\n  color: #ccc;\n}\n.actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n  color: white;\n}\n.btn-small[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  font-size: 12px;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n.btn-danger[_ngcontent-%COMP%] {\n  background: #e74c3c;\n}\n.btn-danger[_ngcontent-%COMP%]:hover {\n  background: #c0392b;\n}\n/*# sourceMappingURL=card-list.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardListComponent, { className: "CardListComponent", filePath: "src\\app\\features\\safety-cards\\components\\card-list.component.ts", lineNumber: 187 });
})();
export {
  CardListComponent
};
//# sourceMappingURL=chunk-JCXIL6A7.js.map
