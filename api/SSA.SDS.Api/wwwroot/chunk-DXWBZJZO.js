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
} from "./chunk-ST22XY74.js";
import {
  ClientService
} from "./chunk-JTHXEV7M.js";
import {
  ActivatedRoute,
  Router,
  RouterLink
} from "./chunk-HKNCC5DQ.js";
import {
  CommonModule,
  NgIf,
  __spreadValues,
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

// src/app/features/clients/components/client-form.component.ts
function ClientFormComponent_div_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1, " Campo obbligatorio ");
    \u0275\u0275elementEnd();
  }
}
function ClientFormComponent_div_42_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1, " Email non valida ");
    \u0275\u0275elementEnd();
  }
}
var ClientFormComponent = class _ClientFormComponent {
  fb;
  route;
  router;
  clientService;
  clientForm;
  isEdit = false;
  isSubmitting = false;
  clientId;
  constructor(fb, route, router, clientService) {
    this.fb = fb;
    this.route = route;
    this.router = router;
    this.clientService = clientService;
  }
  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get("id"));
    this.isEdit = !!this.clientId;
    this.initForm();
    if (this.isEdit) {
      this.loadClient();
    }
  }
  initForm() {
    this.clientForm = this.fb.group({
      ragioneSociale: ["", [Validators.required, Validators.minLength(3)]],
      codiceFiscale: [""],
      indirizzo: [""],
      citta: [""],
      provincia: [""],
      cap: [""],
      telefono: [""],
      email: ["", [Validators.email]],
      contatto: [""],
      note: [""]
    });
  }
  loadClient() {
    if (!this.clientId)
      return;
    this.clientService.getById(this.clientId).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          ragioneSociale: client.ragioneSociale,
          codiceFiscale: client.codiceFiscale,
          indirizzo: client.indirizzo,
          citta: client.citta,
          provincia: client.provincia,
          cap: client.cap,
          telefono: client.telefono,
          email: client.email,
          contatto: client.contatto,
          note: client.note
        });
      },
      error: () => {
        alert("Errore nel caricamento del cliente");
        this.router.navigate(["/clients"]);
      }
    });
  }
  onSubmit() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = this.clientForm.value;
    if (this.isEdit && this.clientId) {
      const updateData = __spreadValues({}, formData);
      this.clientService.update(this.clientId, updateData).subscribe({
        next: () => {
          alert("Cliente aggiornato con successo");
          this.router.navigate(["/clients"]);
        },
        error: () => {
          alert("Errore nell'aggiornamento del cliente");
          this.isSubmitting = false;
        }
      });
    } else {
      const createData = __spreadValues({}, formData);
      this.clientService.create(createData).subscribe({
        next: () => {
          alert("Cliente creato con successo");
          this.router.navigate(["/clients"]);
        },
        error: () => {
          alert("Errore nella creazione del cliente");
          this.isSubmitting = false;
        }
      });
    }
  }
  onCancel() {
    this.router.navigate(["/clients"]);
  }
  static \u0275fac = function ClientFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ClientFormComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ClientService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ClientFormComponent, selectors: [["app-client-form"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 56, vars: 6, consts: [[1, "client-form-page"], [1, "page-header"], ["routerLink", "/clients", 1, "btn", "btn-secondary"], [1, "form-container"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], [1, "form-group"], ["for", "ragioneSociale"], ["type", "text", "id", "ragioneSociale", "formControlName", "ragioneSociale", 1, "form-control"], ["class", "error-message", 4, "ngIf"], ["for", "codiceFiscale"], ["type", "text", "id", "codiceFiscale", "formControlName", "codiceFiscale", 1, "form-control"], ["for", "indirizzo"], ["type", "text", "id", "indirizzo", "formControlName", "indirizzo", 1, "form-control"], ["for", "citta"], ["type", "text", "id", "citta", "formControlName", "citta", 1, "form-control"], ["for", "provincia"], ["type", "text", "id", "provincia", "formControlName", "provincia", 1, "form-control"], ["for", "cap"], ["type", "text", "id", "cap", "formControlName", "cap", 1, "form-control"], ["for", "telefono"], ["type", "text", "id", "telefono", "formControlName", "telefono", 1, "form-control"], ["for", "email"], ["type", "email", "id", "email", "formControlName", "email", 1, "form-control"], ["for", "contatto"], ["type", "text", "id", "contatto", "formControlName", "contatto", 1, "form-control"], [1, "form-group", "full-width"], ["for", "note"], ["id", "note", "formControlName", "note", "rows", "4", 1, "form-control"], [1, "form-actions"], ["type", "button", 1, "btn", "btn-secondary", 3, "click"], ["type", "submit", 1, "btn", "btn-primary", 3, "disabled"], [1, "error-message"]], template: function ClientFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "a", 2);
      \u0275\u0275text(5, "Torna alla lista");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 3)(7, "form", 4);
      \u0275\u0275listener("ngSubmit", function ClientFormComponent_Template_form_ngSubmit_7_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(8, "div", 5)(9, "div", 6)(10, "label", 7);
      \u0275\u0275text(11, "Ragione Sociale *");
      \u0275\u0275elementEnd();
      \u0275\u0275element(12, "input", 8);
      \u0275\u0275template(13, ClientFormComponent_div_13_Template, 2, 0, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 6)(15, "label", 10);
      \u0275\u0275text(16, "Codice Fiscale");
      \u0275\u0275elementEnd();
      \u0275\u0275element(17, "input", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "div", 6)(19, "label", 12);
      \u0275\u0275text(20, "Indirizzo");
      \u0275\u0275elementEnd();
      \u0275\u0275element(21, "input", 13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "div", 6)(23, "label", 14);
      \u0275\u0275text(24, "Citt\xE0");
      \u0275\u0275elementEnd();
      \u0275\u0275element(25, "input", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "div", 6)(27, "label", 16);
      \u0275\u0275text(28, "Provincia");
      \u0275\u0275elementEnd();
      \u0275\u0275element(29, "input", 17);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "div", 6)(31, "label", 18);
      \u0275\u0275text(32, "CAP");
      \u0275\u0275elementEnd();
      \u0275\u0275element(33, "input", 19);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "div", 6)(35, "label", 20);
      \u0275\u0275text(36, "Telefono");
      \u0275\u0275elementEnd();
      \u0275\u0275element(37, "input", 21);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "div", 6)(39, "label", 22);
      \u0275\u0275text(40, "Email");
      \u0275\u0275elementEnd();
      \u0275\u0275element(41, "input", 23);
      \u0275\u0275template(42, ClientFormComponent_div_42_Template, 2, 0, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "div", 6)(44, "label", 24);
      \u0275\u0275text(45, "Contatto");
      \u0275\u0275elementEnd();
      \u0275\u0275element(46, "input", 25);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(47, "div", 26)(48, "label", 27);
      \u0275\u0275text(49, "Note");
      \u0275\u0275elementEnd();
      \u0275\u0275element(50, "textarea", 28);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(51, "div", 29)(52, "button", 30);
      \u0275\u0275listener("click", function ClientFormComponent_Template_button_click_52_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(53, "Annulla");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "button", 31);
      \u0275\u0275text(55);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      let tmp_2_0;
      let tmp_3_0;
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isEdit ? "Modifica Cliente" : "Nuovo Cliente");
      \u0275\u0275advance(4);
      \u0275\u0275property("formGroup", ctx.clientForm);
      \u0275\u0275advance(6);
      \u0275\u0275property("ngIf", ((tmp_2_0 = ctx.clientForm.get("ragioneSociale")) == null ? null : tmp_2_0.errors == null ? null : tmp_2_0.errors["required"]) && ((tmp_2_0 = ctx.clientForm.get("ragioneSociale")) == null ? null : tmp_2_0.touched));
      \u0275\u0275advance(29);
      \u0275\u0275property("ngIf", ((tmp_3_0 = ctx.clientForm.get("email")) == null ? null : tmp_3_0.errors == null ? null : tmp_3_0.errors["email"]) && ((tmp_3_0 = ctx.clientForm.get("email")) == null ? null : tmp_3_0.touched));
      \u0275\u0275advance(12);
      \u0275\u0275property("disabled", ctx.clientForm.invalid || ctx.isSubmitting);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isSubmitting ? "Salvataggio..." : ctx.isEdit ? "Aggiorna" : "Crea", " ");
    }
  }, dependencies: [CommonModule, NgIf, ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, RouterLink], styles: ["\n\n.client-form-page[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #2c3e50;\n}\n.form-container[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 8px;\n  padding: 32px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 20px;\n  margin-bottom: 24px;\n}\n.form-group.full-width[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 8px;\n  font-weight: 600;\n  color: #2c3e50;\n}\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #3498db;\n  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);\n}\n.error-message[_ngcontent-%COMP%] {\n  color: #e74c3c;\n  font-size: 12px;\n  margin-top: 4px;\n}\n.form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding-top: 24px;\n  border-top: 1px solid #eee;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  text-decoration: none;\n  display: inline-block;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #3498db;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #2980b9;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  background: #bdc3c7;\n  cursor: not-allowed;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  background: #95a5a6;\n  color: white;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #7f8c8d;\n}\n@media (max-width: 768px) {\n  .form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=client-form.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ClientFormComponent, { className: "ClientFormComponent", filePath: "src\\app\\features\\clients\\components\\client-form.component.ts", lineNumber: 15 });
})();
export {
  ClientFormComponent
};
//# sourceMappingURL=chunk-DXWBZJZO.js.map
