import {
  ScenarioService
} from "./chunk-M5BBEHHV.js";
import "./chunk-PX24KK2F.js";
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
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-HDSUHL5P.js";

// src/app/features/scenarios/components/scenarios.component.ts
function ScenariosComponent_tr_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 18);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.isLoading ? "Caricamento..." : "Nessuna scheda in scadenza nel periodo selezionato", " ");
  }
}
function ScenariosComponent_tr_50_span_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 22);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const card_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", card_r2.daysRemaining, " giorni");
  }
}
function ScenariosComponent_tr_50_span_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_3_0;
    const card_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ((tmp_3_0 = card_r2.daysRemaining) !== null && tmp_3_0 !== void 0 ? tmp_3_0 : 0) * -1, " giorni fa");
  }
}
function ScenariosComponent_tr_50_Template(rf, ctx) {
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
    \u0275\u0275elementStart(10, "td");
    \u0275\u0275template(11, ScenariosComponent_tr_50_span_11_Template, 2, 1, "span", 19)(12, ScenariosComponent_tr_50_span_12_Template, 2, 1, "span", 20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td")(14, "span", 21);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_6_0;
    let tmp_7_0;
    const card_r2 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r2.clientName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r2.titolo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r2.tipologia);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(9, 8, card_r2.dataScadenza, "dd/MM/yyyy"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ((tmp_6_0 = card_r2.daysRemaining) !== null && tmp_6_0 !== void 0 ? tmp_6_0 : 0) >= 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ((tmp_7_0 = card_r2.daysRemaining) !== null && tmp_7_0 !== void 0 ? tmp_7_0 : 0) < 0);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", ctx_r0.getStatusClass(card_r2.stato));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(card_r2.stato);
  }
}
var ScenariosComponent = class _ScenariosComponent {
  scenarioService;
  expiring = [];
  isLoading = true;
  selectedDays = 90;
  warningCount = 0;
  expiredCount = 0;
  constructor(scenarioService) {
    this.scenarioService = scenarioService;
  }
  ngOnInit() {
    this.loadExpiring();
  }
  loadExpiring() {
    this.isLoading = true;
    this.scenarioService.getExpiring(this.selectedDays).subscribe({
      next: (cards) => {
        this.expiring = cards;
        this.expiredCount = cards.filter((c) => (c.daysRemaining ?? 0) < 0).length;
        this.warningCount = cards.filter((c) => (c.daysRemaining ?? 999) >= 0 && (c.daysRemaining ?? 999) <= 30).length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.expiring = [];
      }
    });
  }
  onFilterChange(event) {
    const target = event.target;
    this.selectedDays = parseInt(target.value, 10);
    this.loadExpiring();
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
        return "badge-valid";
    }
  }
  static \u0275fac = function ScenariosComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScenariosComponent)(\u0275\u0275directiveInject(ScenarioService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ScenariosComponent, selectors: [["app-scenarios"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 51, vars: 5, consts: [[1, "scenarios-page"], [1, "page-header"], [1, "scenarios-filters"], [1, "filter-select", 3, "change"], ["value", "30"], ["value", "60"], ["value", "90"], ["value", "180"], ["value", "365"], [1, "summary-cards"], [1, "summary-card", "summary-expiring"], [1, "summary-number"], [1, "summary-card", "summary-expired"], [1, "summary-card", "summary-total"], [1, "table-container"], [1, "data-table"], [4, "ngIf"], [4, "ngFor", "ngForOf"], ["colspan", "6", 1, "text-center"], ["class", "text-warning", 4, "ngIf"], ["class", "text-danger", 4, "ngIf"], [1, "badge", 3, "ngClass"], [1, "text-warning"], [1, "text-danger"]], template: function ScenariosComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3, "Gestione Scadenze");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(4, "div", 2)(5, "select", 3);
      \u0275\u0275listener("change", function ScenariosComponent_Template_select_change_5_listener($event) {
        return ctx.onFilterChange($event);
      });
      \u0275\u0275elementStart(6, "option", 4);
      \u0275\u0275text(7, "Prossimi 30 giorni");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "option", 5);
      \u0275\u0275text(9, "Prossimi 60 giorni");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(10, "option", 6);
      \u0275\u0275text(11, "Prossimi 90 giorni");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "option", 7);
      \u0275\u0275text(13, "Prossimi 180 giorni");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "option", 8);
      \u0275\u0275text(15, "Prossimo anno");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "div", 9)(17, "div", 10)(18, "h3");
      \u0275\u0275text(19, "In Scadenza (\u226430gg)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "p", 11);
      \u0275\u0275text(21);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(22, "div", 12)(23, "h3");
      \u0275\u0275text(24, "Scadute");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "p", 11);
      \u0275\u0275text(26);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(27, "div", 13)(28, "h3");
      \u0275\u0275text(29, "Totali nel periodo");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "p", 11);
      \u0275\u0275text(31);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(32, "div", 14)(33, "table", 15)(34, "thead")(35, "tr")(36, "th");
      \u0275\u0275text(37, "Cliente");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "th");
      \u0275\u0275text(39, "Scheda");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "th");
      \u0275\u0275text(41, "Tipologia");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "th");
      \u0275\u0275text(43, "Data Scadenza");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "th");
      \u0275\u0275text(45, "Giorni Restanti");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "th");
      \u0275\u0275text(47, "Stato");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(48, "tbody");
      \u0275\u0275template(49, ScenariosComponent_tr_49_Template, 3, 1, "tr", 16)(50, ScenariosComponent_tr_50_Template, 16, 11, "tr", 17);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(21);
      \u0275\u0275textInterpolate(ctx.warningCount);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.expiredCount);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.expiring.length);
      \u0275\u0275advance(18);
      \u0275\u0275property("ngIf", ctx.expiring.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngForOf", ctx.expiring);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, DatePipe], styles: ["\n\n.scenarios-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.scenarios-filters[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.filter-select[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.summary-cards[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  margin-bottom: 24px;\n  flex-wrap: wrap;\n}\n.summary-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  flex: 1;\n  min-width: 140px;\n  text-align: center;\n}\n.summary-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  color: #7f8c8d;\n  font-size: 14px;\n  text-transform: uppercase;\n}\n.summary-number[_ngcontent-%COMP%] {\n  font-size: 32px;\n  font-weight: bold;\n  margin: 0;\n}\n.summary-expiring[_ngcontent-%COMP%]   .summary-number[_ngcontent-%COMP%] {\n  color: #f39c12;\n}\n.summary-expired[_ngcontent-%COMP%]   .summary-number[_ngcontent-%COMP%] {\n  color: #e74c3c;\n}\n.summary-total[_ngcontent-%COMP%]   .summary-number[_ngcontent-%COMP%] {\n  color: #3498db;\n}\n.table-container[_ngcontent-%COMP%] {\n  overflow-x: auto;\n}\n.data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  background: white;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.data-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  text-align: left;\n  border-bottom: 1px solid #eee;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  color: #2c3e50;\n}\n.text-center[_ngcontent-%COMP%] {\n  text-align: center !important;\n  color: #999;\n}\n.text-warning[_ngcontent-%COMP%] {\n  color: #f39c12;\n  font-weight: 600;\n}\n.text-danger[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-weight: 600;\n}\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 600;\n}\n.badge-valid[_ngcontent-%COMP%] {\n  background: #d4edda;\n  color: #155724;\n}\n.badge-expiring[_ngcontent-%COMP%] {\n  background: #fff3cd;\n  color: #856404;\n}\n.badge-expired[_ngcontent-%COMP%] {\n  background: #f8d7da;\n  color: #721c24;\n}\n/*# sourceMappingURL=scenarios.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ScenariosComponent, { className: "ScenariosComponent", filePath: "src\\app\\features\\scenarios\\components\\scenarios.component.ts", lineNumber: 144 });
})();
export {
  ScenariosComponent
};
//# sourceMappingURL=chunk-5F4O2UNP.js.map
