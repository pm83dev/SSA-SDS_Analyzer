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
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-YE2GV6RL.js";

// src/app/features/scenarios/components/dashboard.component.ts
function DashboardComponent_tr_48_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 16);
    \u0275\u0275text(2, "Nessuna scheda presente");
    \u0275\u0275elementEnd()();
  }
}
function DashboardComponent_tr_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "td");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "td");
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "td")(11, "span", 17);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const card_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.clientNames(card_r1) || "\u2014");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r1.titolo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r1.tipologia);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(9, 6, card_r1.dataScadenza, "dd/MM/yyyy"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngClass", ctx_r1.getStatusClass(card_r1.stato));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(card_r1.stato);
  }
}
var DashboardComponent = class _DashboardComponent {
  clientService;
  cardService;
  totalClients = 0;
  totalCards = 0;
  expiringCards = 0;
  expiredCards = 0;
  recentCards = [];
  constructor(clientService, cardService) {
    this.clientService = clientService;
    this.cardService = cardService;
  }
  ngOnInit() {
    this.loadData();
  }
  loadData() {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.totalClients = clients.length;
      },
      error: () => console.error("Errore caricamento clienti")
    });
    this.cardService.getCards().subscribe({
      next: (cards) => {
        this.totalCards = cards.length;
        this.expiringCards = cards.filter((c) => c.stato === "Expiring").length;
        this.expiredCards = cards.filter((c) => c.stato === "Expired").length;
        this.recentCards = [...cards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      },
      error: () => console.error("Errore caricamento schede")
    });
  }
  clientNames(card) {
    return card.clients.map((c) => c.ragioneSociale).join(", ");
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
  static \u0275fac = function DashboardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DashboardComponent)(\u0275\u0275directiveInject(ClientService), \u0275\u0275directiveInject(SafetyCardService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DashboardComponent, selectors: [["app-dashboard"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 50, vars: 6, consts: [[1, "dashboard"], [1, "page-header"], [1, "header-actions"], ["routerLink", "/clients/new", 1, "btn", "btn-primary"], ["routerLink", "/safety-cards/new", 1, "btn", "btn-success"], [1, "stats-grid"], ["routerLink", "/clients", 1, "stat-card"], [1, "stat-number"], ["routerLink", "/safety-cards", 1, "stat-card"], ["routerLink", "/scenarios", 1, "stat-card", "stat-warning"], ["routerLink", "/scenarios", 1, "stat-card", "stat-danger"], [1, "recent-section"], [1, "table-container"], [1, "data-table"], [4, "ngIf"], [4, "ngFor", "ngForOf"], ["colspan", "5", 1, "text-center"], [1, "badge", 3, "ngClass"]], template: function DashboardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3, "Dashboard");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 2)(5, "a", 3);
      \u0275\u0275text(6, "+ Nuovo Cliente");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "a", 4);
      \u0275\u0275text(8, "+ Nuova Scheda");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(9, "div", 5)(10, "div", 6)(11, "h3");
      \u0275\u0275text(12, "Clienti Totali");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "p", 7);
      \u0275\u0275text(14);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(15, "div", 8)(16, "h3");
      \u0275\u0275text(17, "Schede Totali");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "p", 7);
      \u0275\u0275text(19);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "div", 9)(21, "h3");
      \u0275\u0275text(22, "In Scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "p", 7);
      \u0275\u0275text(24);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 10)(26, "h3");
      \u0275\u0275text(27, "Scadute");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "p", 7);
      \u0275\u0275text(29);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(30, "div", 11)(31, "h2");
      \u0275\u0275text(32, "Ultime Schede Aggiunte");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "div", 12)(34, "table", 13)(35, "thead")(36, "tr")(37, "th");
      \u0275\u0275text(38, "Cliente");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(39, "th");
      \u0275\u0275text(40, "Titolo");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(41, "th");
      \u0275\u0275text(42, "Tipologia");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "th");
      \u0275\u0275text(44, "Data Scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "th");
      \u0275\u0275text(46, "Stato");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(47, "tbody");
      \u0275\u0275template(48, DashboardComponent_tr_48_Template, 3, 0, "tr", 14)(49, DashboardComponent_tr_49_Template, 13, 9, "tr", 15);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(14);
      \u0275\u0275textInterpolate(ctx.totalClients);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.totalCards);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.expiringCards);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.expiredCards);
      \u0275\u0275advance(19);
      \u0275\u0275property("ngIf", ctx.recentCards.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngForOf", ctx.recentCards);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, DatePipe, RouterLink], styles: ["\n\n.dashboard[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 20px;\n  margin-bottom: 32px;\n}\n.stat-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  text-align: center;\n  cursor: pointer;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.stat-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.stat-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  color: #7f8c8d;\n  font-size: 14px;\n  text-transform: uppercase;\n}\n.stat-number[_ngcontent-%COMP%] {\n  font-size: 36px;\n  font-weight: bold;\n  color: #2c3e50;\n  margin: 0;\n}\n.stat-warning[_ngcontent-%COMP%]   .stat-number[_ngcontent-%COMP%] {\n  color: #f39c12;\n}\n.stat-danger[_ngcontent-%COMP%]   .stat-number[_ngcontent-%COMP%] {\n  color: #e74c3c;\n}\n.recent-section[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.recent-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 16px 0;\n  color: #2c3e50;\n  font-size: 18px;\n}\n.table-container[_ngcontent-%COMP%] {\n  overflow-x: auto;\n}\n.data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.data-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  text-align: left;\n  border-bottom: 1px solid #eee;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.text-center[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #999;\n}\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 600;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-success[_ngcontent-%COMP%] {\n  background: #27ae60;\n}\n.btn-success[_ngcontent-%COMP%]:hover {\n  background: #219a52;\n}\n/*# sourceMappingURL=dashboard.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DashboardComponent, { className: "DashboardComponent", filePath: "src\\app\\features\\scenarios\\components\\dashboard.component.ts", lineNumber: 170 });
})();
export {
  DashboardComponent
};
//# sourceMappingURL=chunk-DZIXBOJD.js.map
