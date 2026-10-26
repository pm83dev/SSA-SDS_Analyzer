import {
  UserService
} from "./chunk-3LXRPPC5.js";
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  NgControlStatus,
  NgControlStatusGroup,
  NgSelectOption,
  ReactiveFormsModule,
  SelectControlValueAccessor,
  Validators,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption
} from "./chunk-ST22XY74.js";
import {
  ActivatedRoute,
  Router,
  RouterLink
} from "./chunk-HKNCC5DQ.js";
import {
  CommonModule,
  NgForOf,
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
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-XOMSVR7A.js";

// src/app/features/users/components/user-form.component.ts
function UserFormComponent_div_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function UserFormComponent_div_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1, " Minimo 3 caratteri ");
    \u0275\u0275elementEnd();
  }
}
function UserFormComponent_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function UserFormComponent_div_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1, " Minimo 6 caratteri ");
    \u0275\u0275elementEnd();
  }
}
function UserFormComponent_div_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1, " Email non valida ");
    \u0275\u0275elementEnd();
  }
}
function UserFormComponent_option_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 22);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r1 = ctx.$implicit;
    \u0275\u0275property("value", r_r1.value);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r1.label);
  }
}
function UserFormComponent_div_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "label", 23);
    \u0275\u0275text(2, "Stato");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 24)(4, "option", 25);
    \u0275\u0275text(5, "Attivo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "option", 25);
    \u0275\u0275text(7, "Disabilitato");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275property("ngValue", true);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", false);
  }
}
var UserFormComponent = class _UserFormComponent {
  fb;
  route;
  router;
  userService;
  userForm;
  isEdit = false;
  isSubmitting = false;
  userId;
  roles = [
    { value: "Admin", label: "Admin" },
    { value: "Operator", label: "Operatore" }
  ];
  constructor(fb, route, router, userService) {
    this.fb = fb;
    this.route = route;
    this.router = router;
    this.userService = userService;
  }
  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get("id"));
    this.isEdit = !!this.userId;
    this.initForm();
    if (this.isEdit) {
      this.loadUser();
    }
  }
  initForm() {
    this.userForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(3)]],
      password: ["", this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      email: ["", [Validators.email]],
      role: ["Operator", Validators.required],
      isActive: [true]
    });
  }
  loadUser() {
    if (!this.userId)
      return;
    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
        this.userForm.get("username")?.disable();
      },
      error: () => {
        alert("Errore nel caricamento dell'utente");
        this.router.navigate(["/users"]);
      }
    });
  }
  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = this.userForm.value;
    if (this.isEdit && this.userId) {
      const updateData = {
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        password: formData.password || void 0
      };
      this.userService.update(this.userId, updateData).subscribe({
        next: () => {
          alert("Utente aggiornato con successo");
          this.router.navigate(["/users"]);
        },
        error: (err) => {
          alert(err.error?.message || "Errore nell'aggiornamento dell'utente");
          this.isSubmitting = false;
        }
      });
    } else {
      this.userService.create(formData).subscribe({
        next: () => {
          alert("Utente creato con successo");
          this.router.navigate(["/users"]);
        },
        error: (err) => {
          alert(err.error?.message || "Errore nella creazione dell'utente");
          this.isSubmitting = false;
        }
      });
    }
  }
  onCancel() {
    this.router.navigate(["/users"]);
  }
  static \u0275fac = function UserFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UserFormComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(UserService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _UserFormComponent, selectors: [["app-user-form"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 37, vars: 13, consts: [[1, "user-form-page"], [1, "page-header"], ["routerLink", "/users", 1, "btn", "btn-secondary"], [1, "form-container"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], [1, "form-group"], ["for", "username"], ["type", "text", "id", "username", "formControlName", "username", 1, "form-control", 3, "disabled"], ["class", "error-message", 4, "ngIf"], ["for", "password"], ["type", "password", "id", "password", "formControlName", "password", 1, "form-control"], ["for", "email"], ["type", "email", "id", "email", "formControlName", "email", 1, "form-control"], ["for", "role"], ["id", "role", "formControlName", "role", 1, "form-select"], [3, "value", 4, "ngFor", "ngForOf"], ["class", "form-group", 4, "ngIf"], [1, "form-actions"], ["type", "button", 1, "btn", "btn-secondary", 3, "click"], ["type", "submit", 1, "btn", "btn-primary", 3, "disabled"], [1, "error-message"], [3, "value"], ["for", "isActive"], ["id", "isActive", "formControlName", "isActive", 1, "form-select"], [3, "ngValue"]], template: function UserFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 2);
      \u0275\u0275text(5, "Torna alla lista");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 3)(7, "form", 4);
      \u0275\u0275listener("ngSubmit", function UserFormComponent_Template_form_ngSubmit_7_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(8, "div", 5)(9, "div", 6)(10, "label", 7);
      \u0275\u0275text(11, "Username *");
      \u0275\u0275elementEnd();
      \u0275\u0275element(12, "input", 8);
      \u0275\u0275template(13, UserFormComponent_div_13_Template, 2, 0, "div", 9)(14, UserFormComponent_div_14_Template, 2, 0, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "div", 6)(16, "label", 10);
      \u0275\u0275text(17);
      \u0275\u0275elementEnd();
      \u0275\u0275element(18, "input", 11);
      \u0275\u0275template(19, UserFormComponent_div_19_Template, 2, 0, "div", 9)(20, UserFormComponent_div_20_Template, 2, 0, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "div", 6)(22, "label", 12);
      \u0275\u0275text(23, "Email");
      \u0275\u0275elementEnd();
      \u0275\u0275element(24, "input", 13);
      \u0275\u0275template(25, UserFormComponent_div_25_Template, 2, 0, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "div", 6)(27, "label", 14);
      \u0275\u0275text(28, "Ruolo *");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "select", 15);
      \u0275\u0275template(30, UserFormComponent_option_30_Template, 2, 2, "option", 16);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(31, UserFormComponent_div_31_Template, 8, 2, "div", 17);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "div", 18)(33, "button", 19);
      \u0275\u0275listener("click", function UserFormComponent_Template_button_click_33_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(34, "Annulla");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "button", 20);
      \u0275\u0275text(36);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      let tmp_3_0;
      let tmp_4_0;
      let tmp_6_0;
      let tmp_7_0;
      let tmp_8_0;
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isEdit ? "Modifica Utente" : "Nuovo Utente");
      \u0275\u0275advance(4);
      \u0275\u0275property("formGroup", ctx.userForm);
      \u0275\u0275advance(5);
      \u0275\u0275property("disabled", ctx.isEdit);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ((tmp_3_0 = ctx.userForm.get("username")) == null ? null : tmp_3_0.errors == null ? null : tmp_3_0.errors["required"]) && ((tmp_3_0 = ctx.userForm.get("username")) == null ? null : tmp_3_0.touched));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ((tmp_4_0 = ctx.userForm.get("username")) == null ? null : tmp_4_0.errors == null ? null : tmp_4_0.errors["minlength"]) && ((tmp_4_0 = ctx.userForm.get("username")) == null ? null : tmp_4_0.touched));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isEdit ? "Nuova Password (lascia vuoto per non cambiare)" : "Password *");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", !ctx.isEdit && ((tmp_6_0 = ctx.userForm.get("password")) == null ? null : tmp_6_0.errors == null ? null : tmp_6_0.errors["required"]) && ((tmp_6_0 = ctx.userForm.get("password")) == null ? null : tmp_6_0.touched));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ((tmp_7_0 = ctx.userForm.get("password")) == null ? null : tmp_7_0.errors == null ? null : tmp_7_0.errors["minlength"]) && ((tmp_7_0 = ctx.userForm.get("password")) == null ? null : tmp_7_0.touched) && ((tmp_7_0 = ctx.userForm.get("password")) == null ? null : tmp_7_0.value));
      \u0275\u0275advance(5);
      \u0275\u0275property("ngIf", ((tmp_8_0 = ctx.userForm.get("email")) == null ? null : tmp_8_0.errors == null ? null : tmp_8_0.errors["email"]) && ((tmp_8_0 = ctx.userForm.get("email")) == null ? null : tmp_8_0.touched));
      \u0275\u0275advance(5);
      \u0275\u0275property("ngForOf", ctx.roles);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isEdit);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", ctx.userForm.invalid || ctx.isSubmitting);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isSubmitting ? "Salvataggio..." : ctx.isEdit ? "Aggiorna" : "Crea", " ");
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, ReactiveFormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, RouterLink], styles: ["\n\n.user-form-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 20px;\n}\n.form-container[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  padding: 30px;\n  max-width: 600px;\n}\n.form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 20px;\n  margin-bottom: 20px;\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  margin-bottom: 5px;\n  font-weight: 600;\n}\n.error-message[_ngcontent-%COMP%] {\n  color: #dc3545;\n  font-size: 0.875rem;\n  margin-top: 4px;\n}\n.form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding-top: 20px;\n  border-top: 1px solid #dee2e6;\n}\n/*# sourceMappingURL=user-form.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(UserFormComponent, { className: "UserFormComponent", filePath: "src\\app\\features\\users\\components\\user-form.component.ts", lineNumber: 14 });
})();
export {
  UserFormComponent
};
//# sourceMappingURL=chunk-PUIXIVF3.js.map
