import {
  ApiService
} from "./chunk-26ID2PJJ.js";
import {
  HttpClient,
  environment,
  inject,
  ɵɵdefineInjectable
} from "./chunk-YE2GV6RL.js";

// src/app/core/services/safety-card.service.ts
var SafetyCardService = class _SafetyCardService {
  api = inject(ApiService);
  http = inject(HttpClient);
  getCards() {
    return this.api.get("/safety-cards");
  }
  getCard(id) {
    return this.api.get(`/safety-cards/${id}`);
  }
  getCardsByClient(clientId) {
    return this.api.get(`/clients/${clientId}/cards`);
  }
  // Collega al cliente una scheda già presente nell'archivio
  linkToClient(clientId, cardId) {
    return this.api.post(`/clients/${clientId}/cards/${cardId}`, {});
  }
  // Scollega la scheda dal cliente: la scheda resta nell'archivio
  unlinkFromClient(clientId, cardId) {
    return this.api.delete(`/clients/${clientId}/cards/${cardId}`);
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
  // Cliente facoltativo: senza cliente la scheda va solo nell'archivio
  analyzePdf(clientId, file) {
    const formData = new FormData();
    if (clientId)
      formData.append("clientId", clientId.toString());
    formData.append("pdfFile", file);
    return this.api.uploadFile("/safety-cards/analyze-pdf", formData);
  }
  // Il PDF è servito da un endpoint protetto: un semplice <a href> non invia il token,
  // quindi lo si scarica con HttpClient (che aggiunge il token) e lo si apre in una nuova scheda
  openPdf(card) {
    if (!card.pdfUrl)
      return;
    this.http.get(`${environment.apiUrl}${card.pdfUrl}`, { responseType: "blob" }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 6e4);
      },
      error: () => alert("Errore nell'apertura del PDF")
    });
  }
  static \u0275fac = function SafetyCardService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SafetyCardService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SafetyCardService, factory: _SafetyCardService.\u0275fac, providedIn: "root" });
};

export {
  SafetyCardService
};
//# sourceMappingURL=chunk-V6DBU5ZR.js.map
