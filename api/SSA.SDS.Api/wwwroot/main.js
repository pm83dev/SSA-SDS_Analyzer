import {
  ScenarioService
} from "./chunk-NLIQRZZQ.js";
import {
  AuthService
} from "./chunk-6J24ZGQS.js";
import "./chunk-APIYY3YU.js";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  bootstrapApplication,
  provideRouter
} from "./chunk-HKNCC5DQ.js";
import {
  CommonModule,
  NgClass,
  NgForOf,
  NgIf,
  catchError,
  concatMap,
  filter,
  inject,
  provideHttpClient,
  provideZoneChangeDetection,
  throwError,
  withInterceptors,
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
} from "./chunk-XOMSVR7A.js";

// src/app/app.routes.ts
function authGuard() {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  router.navigate(["/login"]);
  return false;
}
function redirectIfAuthenticated() {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    router.navigate(["/dashboard"]);
    return false;
  }
  return true;
}
var routes = [
  {
    path: "login",
    loadComponent: () => import("./chunk-6GXNBYE2.js").then((m) => m.LoginComponent),
    canActivate: [redirectIfAuthenticated]
  },
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full"
  },
  {
    path: "dashboard",
    loadComponent: () => import("./chunk-AWAFQHSR.js").then((m) => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: "clients",
    loadComponent: () => import("./chunk-RZLOJUKY.js").then((m) => m.ClientListComponent),
    canActivate: [authGuard]
  },
  {
    path: "clients/new",
    loadComponent: () => import("./chunk-DXWBZJZO.js").then((m) => m.ClientFormComponent),
    canActivate: [authGuard]
  },
  {
    path: "clients/:id",
    loadComponent: () => import("./chunk-3C6QANYW.js").then((m) => m.ClientDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: "clients/:id/edit",
    loadComponent: () => import("./chunk-DXWBZJZO.js").then((m) => m.ClientFormComponent),
    canActivate: [authGuard]
  },
  {
    path: "safety-cards",
    loadComponent: () => import("./chunk-XFNXDN2G.js").then((m) => m.CardListComponent),
    canActivate: [authGuard]
  },
  {
    path: "safety-cards/new",
    loadComponent: () => import("./chunk-2HKCNOXR.js").then((m) => m.CardFormComponent),
    canActivate: [authGuard]
  },
  {
    path: "safety-cards/:id/edit",
    loadComponent: () => import("./chunk-2HKCNOXR.js").then((m) => m.CardFormComponent),
    canActivate: [authGuard]
  },
  {
    path: "import",
    loadComponent: () => import("./chunk-LKR5MSFR.js").then((m) => m.ImportComponent),
    canActivate: [authGuard]
  },
  {
    path: "scenarios",
    loadComponent: () => import("./chunk-BFBG4SLR.js").then((m) => m.ScenariosComponent),
    canActivate: [authGuard]
  },
  {
    path: "users",
    loadComponent: () => import("./chunk-WLSHQRBA.js").then((m) => m.UserListComponent),
    canActivate: [authGuard]
  },
  {
    path: "users/new",
    loadComponent: () => import("./chunk-PUIXIVF3.js").then((m) => m.UserFormComponent),
    canActivate: [authGuard]
  },
  {
    path: "users/:id/edit",
    loadComponent: () => import("./chunk-PUIXIVF3.js").then((m) => m.UserFormComponent),
    canActivate: [authGuard]
  },
  {
    path: "**",
    redirectTo: "dashboard"
  }
];

// src/app/core/interceptors/auth.interceptor.ts
var authInterceptor = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req).pipe(catchError((error) => {
    if (error.status === 401 && !req.url.includes("/auth/")) {
      return auth.refresh().pipe(concatMap((res) => {
        if (res) {
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${res.accessToken}` }
          });
          return next(cloned);
        }
        auth.logout();
        router.navigate(["/login"]);
        return throwError(() => error);
      }));
    }
    return throwError(() => error);
  }));
};

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes)
  ]
};

// src/app/layout/components/navbar.component.ts
function NavbarComponent_li_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li", 7)(1, "a", 20);
    \u0275\u0275text(2, "Utenti");
    \u0275\u0275elementEnd()();
  }
}
function NavbarComponent_li_25_li_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "li")(1, "a", 19);
    \u0275\u0275listener("click", function NavbarComponent_li_25_li_6_Template_a_click_1_listener($event) {
      const n_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      $event.preventDefault();
      return \u0275\u0275resetView(ctx_r3.markRead(n_r3.id));
    });
    \u0275\u0275elementStart(2, "span", 27);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const n_r3 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", n_r3.type === "Expired" ? "notif-expired" : "notif-warning");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(n_r3.message);
  }
}
function NavbarComponent_li_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "li", 21)(1, "a", 22);
    \u0275\u0275listener("click", function NavbarComponent_li_25_Template_a_click_1_listener($event) {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView($event.preventDefault());
    });
    \u0275\u0275text(2, " Notifiche ");
    \u0275\u0275elementStart(3, "span", 23);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "ul", 18);
    \u0275\u0275template(6, NavbarComponent_li_25_li_6_Template, 4, 2, "li", 24);
    \u0275\u0275elementStart(7, "li");
    \u0275\u0275element(8, "hr", 25);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "li")(10, "a", 26);
    \u0275\u0275listener("click", function NavbarComponent_li_25_Template_a_click_10_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      $event.preventDefault();
      return \u0275\u0275resetView(ctx_r3.markAllRead());
    });
    \u0275\u0275text(11, "Segna tutte come lette");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r3.unreadCount);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r3.notifications);
  }
}
var NavbarComponent = class _NavbarComponent {
  auth;
  scenarioService;
  router;
  username = "Utente";
  role = "";
  unreadCount = 0;
  notifications = [];
  constructor(auth, scenarioService, router) {
    this.auth = auth;
    this.scenarioService = scenarioService;
    this.router = router;
  }
  ngOnInit() {
    this.username = localStorage.getItem("username") || "Utente";
    this.role = localStorage.getItem("userRole") || "";
    this.loadNotifications();
  }
  loadNotifications() {
    this.scenarioService.getNotifications(true).subscribe({
      next: (notifs) => {
        this.unreadCount = notifs.length;
        this.notifications = notifs.slice(0, 5);
      },
      error: () => {
      }
    });
  }
  markRead(id) {
    this.scenarioService.markNotificationRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== id);
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: () => {
      }
    });
  }
  markAllRead() {
    this.scenarioService.markAllNotificationsRead().subscribe({
      next: () => {
        this.unreadCount = 0;
        this.notifications = [];
      },
      error: () => {
      }
    });
  }
  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
  static \u0275fac = function NavbarComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NavbarComponent)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(ScenarioService), \u0275\u0275directiveInject(Router));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NavbarComponent, selectors: [["app-navbar"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 33, vars: 3, consts: [[1, "navbar", "navbar-expand-lg", "navbar-dark", "bg-primary", "sticky-top", "shadow-sm"], [1, "container-fluid"], ["routerLink", "/dashboard", "routerLinkActive", "active", 1, "navbar-brand"], ["type", "button", "data-bs-toggle", "collapse", "data-bs-target", "#navbarNav", 1, "navbar-toggler"], [1, "navbar-toggler-icon"], ["id", "navbarNav", 1, "collapse", "navbar-collapse"], [1, "navbar-nav", "me-auto"], [1, "nav-item"], ["routerLink", "/dashboard", "routerLinkActive", "active", 1, "nav-link"], ["routerLink", "/clients", "routerLinkActive", "active", 1, "nav-link"], ["routerLink", "/safety-cards", "routerLinkActive", "active", 1, "nav-link"], ["routerLink", "/import", "routerLinkActive", "active", 1, "nav-link"], ["routerLink", "/scenarios", "routerLinkActive", "active", 1, "nav-link"], ["class", "nav-item", 4, "ngIf"], [1, "navbar-nav"], ["class", "nav-item dropdown me-2", 4, "ngIf"], [1, "nav-item", "dropdown"], ["href", "#", "role", "button", "data-bs-toggle", "dropdown", 1, "nav-link", 3, "click"], [1, "dropdown-menu", "dropdown-menu-end"], ["href", "#", 1, "dropdown-item", 3, "click"], ["routerLink", "/users", "routerLinkActive", "active", 1, "nav-link"], [1, "nav-item", "dropdown", "me-2"], ["href", "#", "role", "button", "data-bs-toggle", "dropdown", 1, "nav-link", "position-relative", 3, "click"], [1, "badge-notif"], [4, "ngFor", "ngForOf"], [1, "dropdown-divider"], ["href", "#", 1, "dropdown-item", "text-center", 3, "click"], [3, "ngClass"]], template: function NavbarComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "nav", 0)(1, "div", 1)(2, "a", 2);
      \u0275\u0275text(3, "SSA-SDS");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "button", 3);
      \u0275\u0275element(5, "span", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "div", 5)(7, "ul", 6)(8, "li", 7)(9, "a", 8);
      \u0275\u0275text(10, "Dashboard");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "li", 7)(12, "a", 9);
      \u0275\u0275text(13, "Clienti");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(14, "li", 7)(15, "a", 10);
      \u0275\u0275text(16, "Schede");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "li", 7)(18, "a", 11);
      \u0275\u0275text(19, "Import");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "li", 7)(21, "a", 12);
      \u0275\u0275text(22, "Scadenze");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(23, NavbarComponent_li_23_Template, 3, 0, "li", 13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "ul", 14);
      \u0275\u0275template(25, NavbarComponent_li_25_Template, 12, 2, "li", 15);
      \u0275\u0275elementStart(26, "li", 16)(27, "a", 17);
      \u0275\u0275listener("click", function NavbarComponent_Template_a_click_27_listener($event) {
        return $event.preventDefault();
      });
      \u0275\u0275text(28);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "ul", 18)(30, "li")(31, "a", 19);
      \u0275\u0275listener("click", function NavbarComponent_Template_a_click_31_listener($event) {
        $event.preventDefault();
        return ctx.logout();
      });
      \u0275\u0275text(32, "Esci");
      \u0275\u0275elementEnd()()()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(23);
      \u0275\u0275property("ngIf", ctx.role === "Admin");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.unreadCount > 0);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", ctx.username, " ");
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, RouterLink, RouterLinkActive], styles: ["\n\nnav[_ngcontent-%COMP%] {\n  position: sticky !important;\n  top: 0 !important;\n  z-index: 1030 !important;\n}\n.badge-notif[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -2px;\n  right: -8px;\n  background: #e74c3c;\n  color: white;\n  border-radius: 10px;\n  font-size: 11px;\n  padding: 2px 6px;\n  font-weight: 700;\n}\n.notif-expired[_ngcontent-%COMP%] {\n  color: #e74c3c;\n}\n.notif-warning[_ngcontent-%COMP%] {\n  color: #f39c12;\n}\n/*# sourceMappingURL=navbar.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NavbarComponent, { className: "NavbarComponent", filePath: "src\\app\\layout\\components\\navbar.component.ts", lineNumber: 14 });
})();

// src/app/app.ts
function App_app_navbar_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-navbar");
  }
}
var App = class _App {
  title = "SSA-SDS";
  showNavbar = false;
  router = inject(Router);
  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => this.showNavbar = !e.urlAfterRedirects.startsWith("/login"));
  }
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 3, vars: 1, consts: [[4, "ngIf"], [1, "container-fluid", "py-3"]], template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, App_app_navbar_0_Template, 1, 0, "app-navbar", 0);
      \u0275\u0275elementStart(1, "main", 1);
      \u0275\u0275element(2, "router-outlet");
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", ctx.showNavbar);
    }
  }, dependencies: [CommonModule, NgIf, RouterOutlet, NavbarComponent], styles: ["\n\n[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\nmain[_ngcontent-%COMP%] {\n  flex: 1;\n}\n/*# sourceMappingURL=app.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "src\\app\\app.ts", lineNumber: 14 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
