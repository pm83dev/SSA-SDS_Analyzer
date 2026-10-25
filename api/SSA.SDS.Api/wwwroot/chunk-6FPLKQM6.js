import {
  SdsValueComponent
} from "./chunk-4ZJBGPHO.js";
import {
  SDS_FIELDS,
  columnLabel
} from "./chunk-SBOVXDKA.js";
import {
  SafetyCardService
} from "./chunk-V6DBU5ZR.js";
import "./chunk-26ID2PJJ.js";
import {
  ClientService
} from "./chunk-2ZRWPK2W.js";
import {
  ActivatedRoute,
  Router,
  RouterLink
} from "./chunk-NBCZAAC7.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-YE2GV6RL.js";

// src/app/features/clients/components/client-detail.component.ts
var _c0 = (a0) => ["/clients", a0, "edit"];
var _c1 = (a0) => ({ clientId: a0 });
var _c2 = (a0) => ["/safety-cards", a0, "edit"];
function ClientDetailComponent_div_0_option_58_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 22);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r3 = ctx.$implicit;
    \u0275\u0275property("value", c_r3.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", c_r3.titolo, "", c_r3.enteEmittitore ? " \u2013 " + c_r3.enteEmittitore : "", "");
  }
}
function ClientDetailComponent_div_0_th_65_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const f_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("title", f_r4.hint || "");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.columnLabel(f_r4));
  }
}
function ClientDetailComponent_div_0_tr_69_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 24);
    \u0275\u0275text(2, "Nessuna scheda presente per questo cliente");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275attribute("colspan", ctx_r1.fields.length + 1);
  }
}
function ClientDetailComponent_div_0_tr_70_td_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "td", 29)(1, "app-sds-value", 30);
    \u0275\u0275listener("openPdf", function ClientDetailComponent_div_0_tr_70_td_1_Template_app_sds_value_openPdf_1_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.cardService.openPdf($event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const f_r7 = ctx.$implicit;
    const card_r8 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("card", card_r8)("field", f_r7);
  }
}
function ClientDetailComponent_div_0_tr_70_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr");
    \u0275\u0275template(1, ClientDetailComponent_div_0_tr_70_td_1_Template, 2, 2, "td", 25);
    \u0275\u0275elementStart(2, "td", 26)(3, "a", 27);
    \u0275\u0275text(4, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 28);
    \u0275\u0275listener("click", function ClientDetailComponent_div_0_tr_70_Template_button_click_5_listener() {
      const card_r8 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.unlinkCard(card_r8));
    });
    \u0275\u0275text(6, "Scollega");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const card_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.fields);
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(2, _c2, card_r8.id));
  }
}
function ClientDetailComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 3)(1, "div", 4)(2, "h1");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 5)(5, "a", 6);
    \u0275\u0275text(6, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "a", 7);
    \u0275\u0275text(8, "+ Nuova Scheda");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "div", 8)(10, "div", 9)(11, "div", 10)(12, "label");
    \u0275\u0275text(13, "Codice Fiscale");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "p");
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 10)(17, "label");
    \u0275\u0275text(18, "Indirizzo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "p");
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "div", 10)(22, "label");
    \u0275\u0275text(23, "Citt\xE0");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "p");
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "div", 10)(27, "label");
    \u0275\u0275text(28, "CAP");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "p");
    \u0275\u0275text(30);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 10)(32, "label");
    \u0275\u0275text(33, "Telefono");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "p");
    \u0275\u0275text(35);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(36, "div", 10)(37, "label");
    \u0275\u0275text(38, "Email");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "p");
    \u0275\u0275text(40);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(41, "div", 10)(42, "label");
    \u0275\u0275text(43, "Contatto");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(44, "p");
    \u0275\u0275text(45);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(46, "div", 10)(47, "label");
    \u0275\u0275text(48, "Note");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "p");
    \u0275\u0275text(50);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(51, "div", 11)(52, "h2");
    \u0275\u0275text(53);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "div", 12)(55, "select", 13);
    \u0275\u0275listener("change", function ClientDetailComponent_div_0_Template_select_change_55_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cardToLink = +$event.target.value || 0);
    });
    \u0275\u0275elementStart(56, "option", 14);
    \u0275\u0275text(57, "Collega una scheda dall'archivio...");
    \u0275\u0275elementEnd();
    \u0275\u0275template(58, ClientDetailComponent_div_0_option_58_Template, 2, 3, "option", 15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "button", 16);
    \u0275\u0275listener("click", function ClientDetailComponent_div_0_Template_button_click_59_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.linkCard(ctx_r1.cardToLink));
    });
    \u0275\u0275text(60, "Collega");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(61, "div", 17)(62, "table", 18)(63, "thead")(64, "tr");
    \u0275\u0275template(65, ClientDetailComponent_div_0_th_65_Template, 2, 2, "th", 19);
    \u0275\u0275elementStart(66, "th");
    \u0275\u0275text(67, "Azioni");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(68, "tbody");
    \u0275\u0275template(69, ClientDetailComponent_div_0_tr_69_Template, 3, 1, "tr", 20)(70, ClientDetailComponent_div_0_tr_70_Template, 7, 4, "tr", 21);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.client.ragioneSociale);
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(19, _c0, ctx_r1.client.id));
    \u0275\u0275advance(2);
    \u0275\u0275property("queryParams", \u0275\u0275pureFunction1(21, _c1, ctx_r1.client.id));
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(ctx_r1.client.codiceFiscale || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.client.indirizzo || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate2("", ctx_r1.client.citta || "-", " ", ctx_r1.client.provincia ? "(" + ctx_r1.client.provincia + ")" : "", "");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.client.cap || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.client.telefono || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.client.email || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.client.contatto || "-");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.client.note || "-");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("Schede di Sicurezza (", ctx_r1.cards.length, ")");
    \u0275\u0275advance(2);
    \u0275\u0275property("value", ctx_r1.cardToLink || "");
    \u0275\u0275advance(3);
    \u0275\u0275property("ngForOf", ctx_r1.linkableCards);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.cardToLink);
    \u0275\u0275advance(6);
    \u0275\u0275property("ngForOf", ctx_r1.fields);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx_r1.cards.length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.cards);
  }
}
function ClientDetailComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 31)(1, "h1");
    \u0275\u0275text(2, "Cliente non trovato");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "a", 32);
    \u0275\u0275text(4, "Torna alla lista");
    \u0275\u0275elementEnd()();
  }
}
function ClientDetailComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33);
    \u0275\u0275text(1, "Caricamento...");
    \u0275\u0275elementEnd();
  }
}
var ClientDetailComponent = class _ClientDetailComponent {
  route;
  router;
  clientService;
  cardService;
  client;
  // Colonne del file "dati per SDS.xlsx" (senza ID CLIENTE: si è già nella pagina del cliente)
  columnLabel = columnLabel;
  fields = SDS_FIELDS.filter((f) => f.key !== "clients");
  cards = [];
  // Tutte le schede dell'archivio, per collegarne una al cliente
  allCards = [];
  cardToLink = 0;
  get linkableCards() {
    const linked = new Set(this.cards.map((c) => c.id));
    return this.allCards.filter((c) => !linked.has(c.id)).sort((a, b) => a.titolo.localeCompare(b.titolo));
  }
  isLoading = true;
  clientId;
  constructor(route, router, clientService, cardService) {
    this.route = route;
    this.router = router;
    this.clientService = clientService;
    this.cardService = cardService;
  }
  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get("id"));
    if (this.clientId) {
      this.loadClient();
      this.loadCards();
      this.cardService.getCards().subscribe({ next: (cards) => this.allCards = cards, error: () => {
      } });
    }
  }
  linkCard(cardId) {
    if (!this.clientId || !cardId)
      return;
    this.cardService.linkToClient(this.clientId, cardId).subscribe({
      next: () => {
        this.cardToLink = 0;
        this.loadCards();
      },
      error: () => alert("Errore nel collegamento della scheda")
    });
  }
  unlinkCard(card) {
    if (!this.clientId)
      return;
    if (!confirm(`Scollegare la scheda "${card.titolo}" da questo cliente?
La scheda resta nell'archivio.`))
      return;
    this.cardService.unlinkFromClient(this.clientId, card.id).subscribe({
      next: () => this.loadCards(),
      error: () => alert("Errore nello scollegamento della scheda")
    });
  }
  loadClient() {
    if (!this.clientId)
      return;
    this.isLoading = true;
    this.clientService.getById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  loadCards() {
    if (!this.clientId)
      return;
    this.cardService.getCardsByClient(this.clientId).subscribe({
      next: (cards) => {
        this.cards = cards;
      },
      error: () => console.error("Errore caricamento schede")
    });
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
  static \u0275fac = function ClientDetailComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ClientDetailComponent)(\u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ClientService), \u0275\u0275directiveInject(SafetyCardService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ClientDetailComponent, selectors: [["app-client-detail"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 3, vars: 3, consts: [["class", "client-detail-page", 4, "ngIf"], ["class", "not-found", 4, "ngIf"], ["class", "loading", 4, "ngIf"], [1, "client-detail-page"], [1, "page-header"], [1, "header-actions"], [1, "btn", "btn-secondary", 3, "routerLink"], ["routerLink", "/safety-cards/new", 1, "btn", "btn-primary", 3, "queryParams"], [1, "client-info"], [1, "info-grid"], [1, "info-item"], [1, "cards-section"], [1, "link-card"], [1, "form-select", "form-select-sm", 3, "change", "value"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], [1, "btn", "btn-small", "btn-primary", 3, "click", "disabled"], [1, "table-container"], [1, "data-table"], [3, "title", 4, "ngFor", "ngForOf"], [4, "ngIf"], [4, "ngFor", "ngForOf"], [3, "value"], [3, "title"], [1, "text-center"], ["class", "sds-cell", 4, "ngFor", "ngForOf"], [1, "actions"], [1, "btn", "btn-small", "btn-secondary", 3, "routerLink"], ["title", "Toglie la scheda da questo cliente: la scheda resta nell'archivio", 1, "btn", "btn-small", "btn-warning", 3, "click"], [1, "sds-cell"], ["mode", "cell", 3, "openPdf", "card", "field"], [1, "not-found"], ["routerLink", "/clients", 1, "btn", "btn-primary"], [1, "loading"]], template: function ClientDetailComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, ClientDetailComponent_div_0_Template, 71, 23, "div", 0)(1, ClientDetailComponent_div_1_Template, 5, 0, "div", 1)(2, ClientDetailComponent_div_2_Template, 2, 0, "div", 2);
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", ctx.client);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.client && !ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isLoading);
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, RouterLink, SdsValueComponent], styles: ["\n\n.client-detail-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n}\n.client-info[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  margin-bottom: 24px;\n}\n.info-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 20px;\n}\n.info-item[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 12px;\n  color: #7f8c8d;\n  text-transform: uppercase;\n  margin-bottom: 4px;\n}\n.info-item[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n  font-weight: 500;\n}\n.cards-section[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.cards-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 16px 0;\n  color: #2c3e50;\n  font-size: 18px;\n}\n.table-container[_ngcontent-%COMP%] {\n  overflow-x: auto;\n}\n.link-card[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n  margin-bottom: 12px;\n  max-width: 560px;\n}\n.btn-warning[_ngcontent-%COMP%] {\n  background: #f0ad4e;\n  color: white;\n}\n.btn-warning[_ngcontent-%COMP%]:hover {\n  background: #ec971f;\n}\n.sds-cell[_ngcontent-%COMP%] {\n  min-width: 110px;\n  max-width: 260px;\n  vertical-align: top;\n  font-size: 13px;\n}\n.data-table[_ngcontent-%COMP%] {\n  width: max-content;\n  min-width: 100%;\n  border-collapse: collapse;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.data-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 10px;\n  text-align: left;\n  border-bottom: 1px solid #eee;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.text-center[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #999;\n}\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 600;\n}\n.badge-valid[_ngcontent-%COMP%] {\n  background: #d4edda;\n  color: #155724;\n}\n.badge-expiring[_ngcontent-%COMP%] {\n  background: #fff3cd;\n  color: #856404;\n}\n.badge-expired[_ngcontent-%COMP%] {\n  background: #f8d7da;\n  color: #721c24;\n}\n.actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n  color: white;\n}\n.btn-small[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  font-size: 12px;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n.not-found[_ngcontent-%COMP%] {\n  padding: 40px;\n  text-align: center;\n  color: #999;\n}\n.not-found[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  color: #2c3e50;\n  margin-bottom: 16px;\n}\n.loading[_ngcontent-%COMP%] {\n  padding: 40px;\n  text-align: center;\n  color: #999;\n}\n/*# sourceMappingURL=client-detail.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ClientDetailComponent, { className: "ClientDetailComponent", filePath: "src\\app\\features\\clients\\components\\client-detail.component.ts", lineNumber: 18 });
})();
export {
  ClientDetailComponent
};
//# sourceMappingURL=chunk-6FPLKQM6.js.map
