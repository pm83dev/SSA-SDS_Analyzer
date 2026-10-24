import {
  HttpClient,
  environment,
  inject,
  ɵɵdefineInjectable
} from "./chunk-HDSUHL5P.js";

// src/app/core/services/api.service.ts
var ApiService = class _ApiService {
  http = inject(HttpClient);
  baseUrl = `${environment.apiUrl}/api`;
  get url() {
    return this.baseUrl;
  }
  get(endpoint) {
    return this.http.get(`${this.baseUrl}${endpoint}`);
  }
  post(endpoint, body) {
    return this.http.post(`${this.baseUrl}${endpoint}`, body);
  }
  put(endpoint, body) {
    return this.http.put(`${this.baseUrl}${endpoint}`, body);
  }
  delete(endpoint) {
    return this.http.delete(`${this.baseUrl}${endpoint}`);
  }
  uploadFile(endpoint, formData) {
    return this.http.post(`${this.baseUrl}${endpoint}`, formData);
  }
  static \u0275fac = function ApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ApiService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ApiService, factory: _ApiService.\u0275fac, providedIn: "root" });
};

export {
  ApiService
};
//# sourceMappingURL=chunk-PX24KK2F.js.map
