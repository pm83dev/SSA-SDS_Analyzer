import {
  componentNames,
  densityGcm3,
  extractCas,
  frasiHDescription,
  ghsDescription,
  isKnownHCode,
  isToVerify,
  minTeb,
  normalizeGhs,
  sdsValue,
  splitCodes,
  verifyReasons
} from "./chunk-SBOVXDKA.js";
import {
  CommonModule,
  DatePipe,
  EventEmitter,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-XOMSVR7A.js";

// src/app/shared/components/sds-value.component.ts
function SdsValueComponent_span_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 9);
    \u0275\u0275text(1, "\u26A0 da verificare");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("title", ctx_r0.reasonsText);
  }
}
function SdsValueComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 10);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.reasonsText);
  }
}
function SdsValueComponent_ng_container_3_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 14)(1, "span", 15);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r2 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(c_r2.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", c_r2.ragioneSociale, "");
  }
}
function SdsValueComponent_ng_container_3_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 16);
    \u0275\u0275text(1, "archivio");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275elementStart(1, "div", 11);
    \u0275\u0275template(2, SdsValueComponent_ng_container_3_span_2_Template, 4, 2, "span", 12)(3, SdsValueComponent_ng_container_3_span_3_Template, 2, 0, "span", 13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r0.card.clients);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r0.card.clients.length);
  }
}
function SdsValueComponent_div_4_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const code_r3 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("code-unknown", !ctx_r0.isKnownHCode(code_r3));
    \u0275\u0275property("title", code_r3 + " \u2013 " + ctx_r0.frasiHDescription(code_r3));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(code_r3);
  }
}
function SdsValueComponent_div_4_ul_2_li_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li")(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const code_r4 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(code_r4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u2013 ", ctx_r0.frasiHDescription(code_r4), "");
  }
}
function SdsValueComponent_div_4_ul_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ul", 22);
    \u0275\u0275template(1, SdsValueComponent_div_4_ul_2_li_1_Template, 4, 2, "li", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.codes);
  }
}
function SdsValueComponent_div_4_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275template(1, SdsValueComponent_div_4_span_1_Template, 2, 4, "span", 18)(2, SdsValueComponent_div_4_ul_2_Template, 2, 1, "ul", 19)(3, SdsValueComponent_div_4_span_3_Template, 2, 0, "span", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.codes);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.mode === "detail" && ctx_r0.codes.length);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r0.codes.length);
  }
}
function SdsValueComponent_div_5_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 26);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const code_r5 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("code-unknown", !ctx_r0.ghsDescription(code_r5));
    \u0275\u0275property("title", ctx_r0.normalizeGhs(code_r5) + " \u2013 " + (ctx_r0.ghsDescription(code_r5) || "Codice non presente nel foglio Pittogrammi"));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.normalizeGhs(code_r5));
  }
}
function SdsValueComponent_div_5_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275template(1, SdsValueComponent_div_5_span_1_Template, 2, 4, "span", 25)(2, SdsValueComponent_div_5_span_2_Template, 2, 0, "span", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.codes);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r0.codes.length);
  }
}
function SdsValueComponent_div_6_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 29);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cas_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(cas_r6);
  }
}
function SdsValueComponent_div_6_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.text ? "n.d." : "-");
  }
}
function SdsValueComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27);
    \u0275\u0275template(1, SdsValueComponent_div_6_span_1_Template, 2, 1, "span", 28)(2, SdsValueComponent_div_6_span_2_Template, 2, 1, "span", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("title", ctx_r0.text);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.casNumbers);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r0.casNumbers.length);
  }
}
function SdsValueComponent_ng_container_7_ul_1_li_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const n_r7 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(n_r7);
  }
}
function SdsValueComponent_ng_container_7_ul_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ul", 31);
    \u0275\u0275template(1, SdsValueComponent_ng_container_7_ul_1_li_1_Template, 2, 1, "li", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("title", ctx_r0.text);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.names);
  }
}
function SdsValueComponent_ng_container_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_7_ul_1_Template, 2, 2, "ul", 30);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    const empty_r8 = \u0275\u0275reference(16);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.names.length)("ngIfElse", empty_r8);
  }
}
function SdsValueComponent_ng_container_8_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 33);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("title", ctx_r0.text);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.minTeb(ctx_r0.text));
  }
}
function SdsValueComponent_ng_container_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_8_span_1_Template, 2, 2, "span", 32);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    const empty_r8 = \u0275\u0275reference(16);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.text)("ngIfElse", empty_r8);
  }
}
function SdsValueComponent_ng_container_9_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 33);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("title", ctx_r0.text);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.densityGcm3(ctx_r0.text));
  }
}
function SdsValueComponent_ng_container_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_9_span_1_Template, 2, 2, "span", 32);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    const empty_r8 = \u0275\u0275reference(16);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.text)("ngIfElse", empty_r8);
  }
}
function SdsValueComponent_ng_container_10_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 35);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.text);
  }
}
function SdsValueComponent_ng_container_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_10_span_1_Template, 2, 1, "span", 34);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    const empty_r8 = \u0275\u0275reference(16);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.text)("ngIfElse", empty_r8);
  }
}
function SdsValueComponent_ng_container_11_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 38);
    \u0275\u0275text(1, "S\xEC");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_ng_container_11_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "No");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_ng_container_11_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_ng_container_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_11_span_1_Template, 2, 0, "span", 36)(2, SdsValueComponent_ng_container_11_span_2_Template, 2, 0, "span", 37)(3, SdsValueComponent_ng_container_11_span_3_Template, 2, 0, "span", 20);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.value === true);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.value === false);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.value !== true && ctx_r0.value !== false);
  }
}
function SdsValueComponent_div_12_a_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "a", 42);
    \u0275\u0275listener("click", function SdsValueComponent_div_12_a_1_Template_a_click_0_listener($event) {
      \u0275\u0275restoreView(_r9);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("href", ctx_r0.text, \u0275\u0275sanitizeUrl);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.mode === "cell" ? "Link" : ctx_r0.text, " ");
  }
}
function SdsValueComponent_div_12_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.text);
  }
}
function SdsValueComponent_div_12_a_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "a", 43);
    \u0275\u0275listener("click", function SdsValueComponent_div_12_a_3_Template_a_click_0_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r0 = \u0275\u0275nextContext(2);
      $event.preventDefault();
      $event.stopPropagation();
      return \u0275\u0275resetView(ctx_r0.openPdf.emit(ctx_r0.card));
    });
    \u0275\u0275text(1, "PDF allegato");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_div_12_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
function SdsValueComponent_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 39);
    \u0275\u0275template(1, SdsValueComponent_div_12_a_1_Template, 2, 2, "a", 40)(2, SdsValueComponent_div_12_span_2_Template, 2, 1, "span", 37)(3, SdsValueComponent_div_12_a_3_Template, 2, 0, "a", 41)(4, SdsValueComponent_div_12_span_4_Template, 2, 0, "span", 20);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.isUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.text && !ctx_r0.isUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.card.hasPdf && ctx_r0.card.pdfUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r0.text && !ctx_r0.card.hasPdf);
  }
}
function SdsValueComponent_ng_container_13_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "date");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(2, 1, ctx_r0.value, "dd/MM/yyyy"));
  }
}
function SdsValueComponent_ng_container_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_13_span_1_Template, 3, 4, "span", 44);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    const empty_r8 = \u0275\u0275reference(16);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.value)("ngIfElse", empty_r8);
  }
}
function SdsValueComponent_ng_container_14_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.text);
  }
}
function SdsValueComponent_ng_container_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SdsValueComponent_ng_container_14_span_1_Template, 2, 1, "span", 44);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    const empty_r8 = \u0275\u0275reference(16);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.text)("ngIfElse", empty_r8);
  }
}
function SdsValueComponent_ng_template_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1, "-");
    \u0275\u0275elementEnd();
  }
}
var SdsValueComponent = class _SdsValueComponent {
  card;
  field;
  mode = "cell";
  openPdf = new EventEmitter();
  frasiHDescription = frasiHDescription;
  isKnownHCode = isKnownHCode;
  normalizeGhs = normalizeGhs;
  ghsDescription = ghsDescription;
  minTeb = minTeb;
  densityGcm3 = densityGcm3;
  // Il dato non è stato ritrovato nel testo della SDS durante l'import: va controllato sulla scheda
  get toVerify() {
    return isToVerify(this.card, this.field.key);
  }
  get reasonsText() {
    return verifyReasons(this.card, this.field.key).join("\n") || "Dato non verificato nel testo della SDS";
  }
  get value() {
    return sdsValue(this.card, this.field.key);
  }
  get text() {
    const v = this.value;
    return v === null || v === void 0 ? "" : String(v);
  }
  get codes() {
    return splitCodes(this.text);
  }
  get casNumbers() {
    return extractCas(this.text);
  }
  // La colonna Composizione mostra solo i nomi dei componenti
  get names() {
    return componentNames(this.card);
  }
  get isUrl() {
    return /^https?:\/\//i.test(this.text);
  }
  static \u0275fac = function SdsValueComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SdsValueComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SdsValueComponent, selectors: [["app-sds-value"]], hostVars: 2, hostBindings: function SdsValueComponent_HostBindings(rf, ctx) {
    if (rf & 2) {
      \u0275\u0275classProp("to-verify", ctx.toVerify);
    }
  }, inputs: { card: "card", field: "field", mode: "mode" }, outputs: { openPdf: "openPdf" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 17, vars: 14, consts: [["empty", ""], ["class", "verify-tag", 3, "title", 4, "ngIf"], ["class", "verify-reason", 4, "ngIf"], [3, "ngSwitch"], [4, "ngSwitchCase"], ["class", "codes", 4, "ngSwitchCase"], ["class", "codes", 3, "title", 4, "ngSwitchCase"], ["class", "sds-links", 4, "ngSwitchCase"], [4, "ngSwitchDefault"], [1, "verify-tag", 3, "title"], [1, "verify-reason"], [1, "client-list"], ["class", "client-ref", 4, "ngFor", "ngForOf"], ["class", "empty", "title", "Scheda non collegata a nessun cliente", 4, "ngIf"], [1, "client-ref"], [1, "client-id"], ["title", "Scheda non collegata a nessun cliente", 1, "empty"], [1, "codes"], ["class", "code-tag", 3, "code-unknown", "title", 4, "ngFor", "ngForOf"], ["class", "h-desc", 4, "ngIf"], ["class", "empty", 4, "ngIf"], [1, "code-tag", 3, "title"], [1, "h-desc"], [4, "ngFor", "ngForOf"], [1, "empty"], ["class", "code-tag code-ghs", 3, "code-unknown", "title", 4, "ngFor", "ngForOf"], [1, "code-tag", "code-ghs", 3, "title"], [1, "codes", 3, "title"], ["class", "code-tag code-cas", 4, "ngFor", "ngForOf"], [1, "code-tag", "code-cas"], ["class", "comp-list", 3, "title", 4, "ngIf", "ngIfElse"], [1, "comp-list", 3, "title"], [3, "title", 4, "ngIf", "ngIfElse"], [3, "title"], ["class", "file-name", 4, "ngIf", "ngIfElse"], [1, "file-name"], ["class", "badge-yes", 4, "ngIf"], [4, "ngIf"], [1, "badge-yes"], [1, "sds-links"], ["target", "_blank", "rel", "noopener", 3, "href", "click", 4, "ngIf"], ["href", "#", "class", "pdf-link", 3, "click", 4, "ngIf"], ["target", "_blank", "rel", "noopener", 3, "click", "href"], ["href", "#", 1, "pdf-link", 3, "click"], [4, "ngIf", "ngIfElse"]], template: function SdsValueComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, SdsValueComponent_span_0_Template, 2, 1, "span", 1)(1, SdsValueComponent_div_1_Template, 2, 1, "div", 2);
      \u0275\u0275elementContainerStart(2, 3);
      \u0275\u0275template(3, SdsValueComponent_ng_container_3_Template, 4, 2, "ng-container", 4)(4, SdsValueComponent_div_4_Template, 4, 3, "div", 5)(5, SdsValueComponent_div_5_Template, 3, 2, "div", 5)(6, SdsValueComponent_div_6_Template, 3, 3, "div", 6)(7, SdsValueComponent_ng_container_7_Template, 2, 2, "ng-container", 4)(8, SdsValueComponent_ng_container_8_Template, 2, 2, "ng-container", 4)(9, SdsValueComponent_ng_container_9_Template, 2, 2, "ng-container", 4)(10, SdsValueComponent_ng_container_10_Template, 2, 2, "ng-container", 4)(11, SdsValueComponent_ng_container_11_Template, 4, 3, "ng-container", 4)(12, SdsValueComponent_div_12_Template, 5, 4, "div", 7)(13, SdsValueComponent_ng_container_13_Template, 2, 2, "ng-container", 4)(14, SdsValueComponent_ng_container_14_Template, 2, 2, "ng-container", 8);
      \u0275\u0275elementContainerEnd();
      \u0275\u0275template(15, SdsValueComponent_ng_template_15_Template, 2, 0, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", ctx.toVerify);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.toVerify && ctx.mode === "detail");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitch", ctx.field.kind);
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "client");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "hcodes");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "ghs");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "cas");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "names");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "teb");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "density");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "file");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "bool");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "url");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "date");
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, DatePipe], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  overflow-wrap: break-word;\n}\n.verify-tag[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin-bottom: 3px;\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: #fff3cd;\n  color: #8a5a00;\n  border: 1px solid #f0c36d;\n  font-size: 11px;\n  font-weight: 700;\n  white-space: nowrap;\n  cursor: help;\n}\n.verify-reason[_ngcontent-%COMP%] {\n  margin: 2px 0 6px;\n  font-size: 12px;\n  color: #8a5a00;\n  white-space: pre-line;\n}\n.client-id[_ngcontent-%COMP%] {\n  display: inline-block;\n  min-width: 22px;\n  padding: 0 5px;\n  border-radius: 4px;\n  background: #eef2f7;\n  font-size: 12px;\n  font-weight: 700;\n  text-align: center;\n}\n.codes[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.client-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.client-ref[_ngcontent-%COMP%] {\n  white-space: nowrap;\n}\n.code-tag[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 2px 6px;\n  border-radius: 4px;\n  background: #eef2f7;\n  color: #2c3e50;\n  font-size: 11px;\n  font-weight: 600;\n  white-space: nowrap;\n  cursor: help;\n}\n.code-unknown[_ngcontent-%COMP%] {\n  outline: 1px dashed #e74c3c;\n}\n.code-ghs[_ngcontent-%COMP%] {\n  background: #fdecea;\n  color: #a93226;\n}\n.code-cas[_ngcontent-%COMP%] {\n  background: #eef7f0;\n  color: #1e6b3a;\n  font-family: Consolas, monospace;\n}\n.file-name[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #555;\n}\n.h-desc[_ngcontent-%COMP%] {\n  width: 100%;\n  margin: 8px 0 0;\n  padding-left: 18px;\n  font-size: 13px;\n}\n.comp-list[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 16px;\n  font-size: 13px;\n}\n.comp-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-bottom: 2px;\n}\n.pre-wrap[_ngcontent-%COMP%] {\n  white-space: pre-wrap;\n}\n.badge-yes[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border-radius: 10px;\n  background: #fff3cd;\n  color: #856404;\n  font-weight: 600;\n  font-size: 12px;\n}\n.sds-links[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.sds-links[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #3498db;\n  font-weight: 600;\n  font-size: 13px;\n  overflow-wrap: anywhere;\n}\n.empty[_ngcontent-%COMP%] {\n  color: #bbb;\n}\n/*# sourceMappingURL=sds-value.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SdsValueComponent, { className: "SdsValueComponent", filePath: "src\\app\\shared\\components\\sds-value.component.ts", lineNumber: 18 });
})();

export {
  SdsValueComponent
};
//# sourceMappingURL=chunk-3B7XZ34X.js.map
