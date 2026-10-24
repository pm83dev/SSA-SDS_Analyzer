import {
  ApiService
} from "./chunk-PX24KK2F.js";
import {
  inject,
  ɵɵdefineInjectable
} from "./chunk-HDSUHL5P.js";

// src/app/core/services/safety-card.service.ts
var SafetyCardService = class _SafetyCardService {
  api = inject(ApiService);
  getCards() {
    return this.api.get("/safety-cards");
  }
  getCard(id) {
    return this.api.get(`/safety-cards/${id}`);
  }
  getCardsByClient(clientId) {
    return this.api.get(`/clients/${clientId}/cards`);
  }
  createCard(request) {
    return this.api.post("/safety-cards", request);
  }
  updateCard(id, request) {
    return this.api.put(`/safety-cards/${id}`, request);
  }
  deleteCard(id) {
    return this.api.delete(`/safety-cards/${id}`);
  }
  uploadPdf(cardId, formData) {
    return this.api.uploadFile(`/safety-cards/${cardId}/upload-pdf`, formData);
  }
  deletePdf(cardId) {
    return this.api.delete(`/safety-cards/${cardId}/pdf`);
  }
  getPdfUrl(cardId) {
    return this.api.get(`/safety-cards/${cardId}/pdf-url`);
  }
  analyzePdf(clientId, file) {
    const formData = new FormData();
    formData.append("clientId", clientId.toString());
    formData.append("pdfFile", file);
    return this.api.uploadFile("/safety-cards/analyze-pdf", formData);
  }
  static \u0275fac = function SafetyCardService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SafetyCardService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SafetyCardService, factory: _SafetyCardService.\u0275fac, providedIn: "root" });
};

export {
  SafetyCardService
};
//# sourceMappingURL=chunk-YV7K3B3X.js.map
