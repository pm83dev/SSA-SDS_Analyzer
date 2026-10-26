import {
  UserService
} from "./chunk-3LXRPPC5.js";
import {
  AuthService
} from "./chunk-6J24ZGQS.js";
import {
  RouterLink
} from "./chunk-HKNCC5DQ.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpropertyInterpolate1,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-XOMSVR7A.js";

// src/app/features/users/components/user-list.component.ts
function UserListComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5);
    \u0275\u0275element(1, "div", 6);
    \u0275\u0275elementStart(2, "p");
    \u0275\u0275text(3, "Caricamento utenti...");
    \u0275\u0275elementEnd()();
  }
}
function UserListComponent_div_7_tr_21_button_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 13);
    \u0275\u0275listener("click", function UserListComponent_div_7_tr_21_button_20_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const user_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.deleteUser(user_r2.id, user_r2.username));
    });
    \u0275\u0275text(1, "Disabilita");
    \u0275\u0275elementEnd();
  }
}
function UserListComponent_div_7_tr_21_Template(rf, ctx) {
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
    \u0275\u0275elementStart(7, "td")(8, "span");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "td")(11, "span");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "td");
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "td");
    \u0275\u0275text(16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "td")(18, "a", 11);
    \u0275\u0275text(19, "Modifica");
    \u0275\u0275elementEnd();
    \u0275\u0275template(20, UserListComponent_div_7_tr_21_button_20_Template, 2, 0, "button", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const user_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(user_r2.id);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(user_r2.username);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(user_r2.email || "-");
    \u0275\u0275advance(2);
    \u0275\u0275classMap(ctx_r2.getRoleBadgeClass(user_r2.role));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(user_r2.role);
    \u0275\u0275advance(2);
    \u0275\u0275classMap(ctx_r2.getStatusBadgeClass(user_r2.isActive));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(user_r2.isActive ? "Attivo" : "Disabilitato");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.formatDate(user_r2.lastLogin));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.formatDate(user_r2.createdAt));
    \u0275\u0275advance(2);
    \u0275\u0275propertyInterpolate1("routerLink", "/users/", user_r2.id, "/edit");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", user_r2.id !== ctx_r2.getCurrentUserId());
  }
}
function UserListComponent_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7)(1, "table", 8)(2, "thead", 9)(3, "tr")(4, "th");
    \u0275\u0275text(5, "ID");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th");
    \u0275\u0275text(7, "Username");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th");
    \u0275\u0275text(9, "Email");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th");
    \u0275\u0275text(11, "Ruolo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th");
    \u0275\u0275text(13, "Stato");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th");
    \u0275\u0275text(15, "Ultimo Accesso");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "th");
    \u0275\u0275text(17, "Creato");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "th");
    \u0275\u0275text(19, "Azioni");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "tbody");
    \u0275\u0275template(21, UserListComponent_div_7_tr_21_Template, 21, 14, "tr", 10);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(21);
    \u0275\u0275property("ngForOf", ctx_r2.users);
  }
}
var UserListComponent = class _UserListComponent {
  userService;
  authService;
  users = [];
  isLoading = true;
  isAdmin = false;
  constructor(userService, authService) {
    this.userService = userService;
    this.authService = authService;
  }
  ngOnInit() {
    const role = localStorage.getItem("userRole");
    this.isAdmin = role === "Admin";
    this.loadUsers();
  }
  loadUsers() {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert("Errore nel caricamento degli utenti");
      }
    });
  }
  deleteUser(id, username) {
    if (!confirm(`Sei sicuro di voler disabilitare l'utente ${username}?`))
      return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
        alert("Utente disabilitato con successo");
      },
      error: (err) => {
        alert(err.error?.message || "Errore nella disabilitazione dell'utente");
      }
    });
  }
  formatDate(dateStr) {
    if (!dateStr)
      return "-";
    return new Date(dateStr).toLocaleDateString("it-IT");
  }
  getRoleBadgeClass(role) {
    return role === "Admin" ? "badge bg-danger" : "badge bg-secondary";
  }
  getStatusBadgeClass(isActive) {
    return isActive ? "badge bg-success" : "badge bg-warning text-dark";
  }
  getCurrentUserId() {
    return Number(localStorage.getItem("userId")) || 0;
  }
  static \u0275fac = function UserListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UserListComponent)(\u0275\u0275directiveInject(UserService), \u0275\u0275directiveInject(AuthService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _UserListComponent, selectors: [["app-user-list"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 8, vars: 2, consts: [[1, "user-list-page"], [1, "page-header"], ["routerLink", "/users/new", 1, "btn", "btn-primary"], ["class", "loading-container", 4, "ngIf"], ["class", "users-container", 4, "ngIf"], [1, "loading-container"], ["role", "status", 1, "spinner-border", "text-primary"], [1, "users-container"], [1, "table", "table-striped", "table-hover"], [1, "table-dark"], [4, "ngFor", "ngForOf"], [1, "btn", "btn-sm", "btn-outline-primary", "me-1", 3, "routerLink"], ["class", "btn btn-sm btn-outline-danger", 3, "click", 4, "ngIf"], [1, "btn", "btn-sm", "btn-outline-danger", 3, "click"]], template: function UserListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3, "Gestione Utenti");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 2);
      \u0275\u0275text(5, "+ Nuovo Utente");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(6, UserListComponent_div_6_Template, 4, 0, "div", 3)(7, UserListComponent_div_7_Template, 22, 1, "div", 4);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(6);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading);
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, RouterLink], styles: ["\n\n.user-list-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 20px;\n}\n.loading-container[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px;\n}\n.users-container[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  overflow-x: auto;\n}\ntable[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n}\n.table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%], \n.table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  vertical-align: middle;\n}\n/*# sourceMappingURL=user-list.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(UserListComponent, { className: "UserListComponent", filePath: "src\\app\\features\\users\\components\\user-list.component.ts", lineNumber: 14 });
})();
export {
  UserListComponent
};
//# sourceMappingURL=chunk-WLSHQRBA.js.map
