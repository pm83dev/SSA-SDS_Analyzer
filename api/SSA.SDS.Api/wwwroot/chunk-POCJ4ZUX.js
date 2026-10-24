import {
  AuthService
} from "./chunk-TX7OKUSU.js";
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  Validators,
  ɵNgNoValidate
} from "./chunk-2H57EDAN.js";
import {
  Router
} from "./chunk-NBCZAAC7.js";
import {
  CommonModule,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-YE2GV6RL.js";

// src/app/features/auth/components/login.component.ts
function LoginComponent_div_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.error);
  }
}
var LoginComponent = class _LoginComponent {
  fb;
  auth;
  router;
  loginForm;
  isSubmitting = false;
  error = "";
  constructor(fb, auth, router) {
    this.fb = fb;
    this.auth = auth;
    this.router = router;
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
  }
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.error = "";
    const { username, password } = this.loginForm.value;
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(["/dashboard"]),
      error: () => {
        this.error = "Credenziali non valide. Riprova.";
        this.isSubmitting = false;
      }
    });
  }
  static \u0275fac = function LoginComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LoginComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LoginComponent, selectors: [["app-login"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 18, vars: 4, consts: [[1, "login-wrapper"], [1, "login-card"], [1, "subtitle"], [3, "ngSubmit", "formGroup"], [1, "form-group"], ["for", "username"], ["id", "username", "type", "text", "formControlName", "username", "placeholder", "Inserisci username", 1, "form-control"], ["for", "password"], ["id", "password", "type", "password", "formControlName", "password", "placeholder", "Inserisci password", 1, "form-control"], ["class", "error-message", 4, "ngIf"], ["type", "submit", 1, "btn", "btn-primary", 3, "disabled"], [1, "error-message"]], template: function LoginComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3, "SSA-SDS");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "p", 2);
      \u0275\u0275text(5, "Schede di Sicurezza Management");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "form", 3);
      \u0275\u0275listener("ngSubmit", function LoginComponent_Template_form_ngSubmit_6_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(7, "div", 4)(8, "label", 5);
      \u0275\u0275text(9, "Username");
      \u0275\u0275elementEnd();
      \u0275\u0275element(10, "input", 6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "div", 4)(12, "label", 7);
      \u0275\u0275text(13, "Password");
      \u0275\u0275elementEnd();
      \u0275\u0275element(14, "input", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275template(15, LoginComponent_div_15_Template, 2, 1, "div", 9);
      \u0275\u0275elementStart(16, "button", 10);
      \u0275\u0275text(17);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(6);
      \u0275\u0275property("formGroup", ctx.loginForm);
      \u0275\u0275advance(9);
      \u0275\u0275property("ngIf", ctx.error);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", ctx.loginForm.invalid || ctx.isSubmitting);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isSubmitting ? "Accesso in corso..." : "Accedi", " ");
    }
  }, dependencies: [CommonModule, NgIf, ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName], styles: ["\n\n.login-wrapper[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  padding: 20px;\n}\n.login-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 12px;\n  padding: 40px;\n  width: 100%;\n  max-width: 400px;\n  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);\n}\n.login-card[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0 0 4px 0;\n  color: #2c3e50;\n  font-size: 28px;\n}\n.subtitle[_ngcontent-%COMP%] {\n  color: #7f8c8d;\n  margin: 0 0 28px 0;\n  font-size: 14px;\n}\n.form-group[_ngcontent-%COMP%] {\n  margin-bottom: 18px;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 6px;\n  font-weight: 600;\n  color: #2c3e50;\n  font-size: 14px;\n}\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 11px 14px;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  font-size: 14px;\n  box-sizing: border-box;\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);\n}\n.btn[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 12px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 15px;\n  font-weight: 600;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #667eea;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #5a6fd6;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  background: #bdc3c7;\n  cursor: not-allowed;\n}\n.error-message[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-size: 13px;\n  margin-bottom: 12px;\n}\n/*# sourceMappingURL=login.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LoginComponent, { className: "LoginComponent", filePath: "src\\app\\features\\auth\\components\\login.component.ts", lineNumber: 105 });
})();
export {
  LoginComponent
};
//# sourceMappingURL=chunk-POCJ4ZUX.js.map
