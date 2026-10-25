import {
  ClientService
} from "./chunk-2ZRWPK2W.js";
import {
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
  ɵɵtextInterpolate1
} from "./chunk-YE2GV6RL.js";

// src/app/features/clients/components/client-list.component.ts
var _c0 = (a0) => ["/clients", a0];
var _c1 = (a0) => ["/clients", a0, "edit"];
function ClientListComponent_tr_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 9);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.isLoading ? "Caricamento..." : "Nessun cliente trovato", " ");
  }
}
function ClientListComponent_tr_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "a", 10);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "td");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "td");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "td");
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "td");
    \u0275\u0275text(13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "td", 11)(15, "a", 12);
    \u0275\u0275text(16, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "button", 13);
    \u0275\u0275listener("click", function ClientListComponent_tr_28_Template_button_click_17_listener() {
      const client_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onDelete(client_r3));
    });
    \u0275\u0275text(18, "Elimina");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const client_r3 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(8, _c0, client_r3.id));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(client_r3.ragioneSociale);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(client_r3.codiceFiscale || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(client_r3.citta || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(client_r3.telefono || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(client_r3.email || "-");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(client_r3.totalCards);
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(10, _c1, client_r3.id));
  }
}
var ClientListComponent = class _ClientListComponent {
  clientService;
  router;
  clients = [];
  filteredClients = [];
  isLoading = true;
  constructor(clientService, router) {
    this.clientService = clientService;
    this.router = router;
  }
  ngOnInit() {
    this.loadClients();
  }
  loadClients() {
    this.isLoading = true;
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert("Errore nel caricamento dei clienti");
      }
    });
  }
  onSearch(event) {
    const term = event.target.value.toLowerCase();
    this.filteredClients = this.clients.filter((c) => c.ragioneSociale.toLowerCase().includes(term) || c.citta && c.citta.toLowerCase().includes(term) || c.email && c.email.toLowerCase().includes(term));
  }
  onDelete(client) {
    const schede = client.totalCards > 0 ? `

Le sue ${client.totalCards} schede di sicurezza restano nell'archivio (vengono solo scollegate).` : "";
    if (confirm(`Sei sicuro di voler eliminare il cliente "${client.ragioneSociale}"?${schede}`)) {
      this.clientService.delete(client.id).subscribe({
        next: () => {
          alert("Cliente eliminato con successo");
          this.loadClients();
        },
        error: () => {
          alert("Errore nell'eliminazione del cliente");
        }
      });
    }
  }
  static \u0275fac = function ClientListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ClientListComponent)(\u0275\u0275directiveInject(ClientService), \u0275\u0275directiveInject(Router));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ClientListComponent, selectors: [["app-client-list"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 29, vars: 2, consts: [[1, "client-list-page"], [1, "page-header"], ["routerLink", "/clients/new", 1, "btn", "btn-primary"], [1, "search-bar"], ["type", "text", "placeholder", "Cerca cliente...", 1, "search-input", 3, "input"], [1, "table-container"], [1, "data-table"], [4, "ngIf"], [4, "ngFor", "ngForOf"], ["colspan", "7", 1, "text-center"], [1, "client-link", 3, "routerLink"], [1, "actions"], [1, "btn", "btn-small", "btn-secondary", 3, "routerLink"], [1, "btn", "btn-small", "btn-danger", 3, "click"]], template: function ClientListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3, "Clienti");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 2);
      \u0275\u0275text(5, "+ Nuovo Cliente");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 3)(7, "input", 4);
      \u0275\u0275listener("input", function ClientListComponent_Template_input_input_7_listener($event) {
        return ctx.onSearch($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "div", 5)(9, "table", 6)(10, "thead")(11, "tr")(12, "th");
      \u0275\u0275text(13, "Ragione Sociale");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "th");
      \u0275\u0275text(15, "Codice Fiscale");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "th");
      \u0275\u0275text(17, "Citt\xE0");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "th");
      \u0275\u0275text(19, "Telefono");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "th");
      \u0275\u0275text(21, "Email");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "th");
      \u0275\u0275text(23, "Schede");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "th");
      \u0275\u0275text(25, "Azioni");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(26, "tbody");
      \u0275\u0275template(27, ClientListComponent_tr_27_Template, 3, 1, "tr", 7)(28, ClientListComponent_tr_28_Template, 19, 12, "tr", 8);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(27);
      \u0275\u0275property("ngIf", ctx.filteredClients.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngForOf", ctx.filteredClients);
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, RouterLink], styles: ["\n\n.client-list-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 20px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.search-bar[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 400px;\n  padding: 10px 16px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.search-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #3498db;\n  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);\n}\n.table-container[_ngcontent-%COMP%] {\n  overflow-x: auto;\n}\n.data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  background: white;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  border-radius: 8px;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.data-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  text-align: left;\n  border-bottom: 1px solid #eee;\n}\n.data-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.text-center[_ngcontent-%COMP%] {\n  text-align: center !important;\n  color: #999;\n}\n.client-link[_ngcontent-%COMP%] {\n  color: #3498db;\n  text-decoration: none;\n  font-weight: 600;\n}\n.client-link[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n  color: white;\n}\n.btn-small[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  font-size: 12px;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n.btn-danger[_ngcontent-%COMP%] {\n  background: #e74c3c;\n}\n.btn-danger[_ngcontent-%COMP%]:hover {\n  background: #c0392b;\n}\n/*# sourceMappingURL=client-list.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ClientListComponent, { className: "ClientListComponent", filePath: "src\\app\\features\\clients\\components\\client-list.component.ts", lineNumber: 14 });
})();
export {
  ClientListComponent
};
//# sourceMappingURL=chunk-6YUHEO6D.js.map
