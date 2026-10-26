import {
  HttpClient,
  HttpHeaders,
  environment,
  inject,
  ɵɵdefineInjectable
} from "./chunk-XOMSVR7A.js";

// src/app/core/services/client.service.ts
var ClientService = class _ClientService {
  http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}/api/clients`;
  // environment.apiUrl = host base ('' in dev con proxy, '' in prod)
  getHeaders() {
    const token = localStorage.getItem("accessToken");
    return new HttpHeaders({
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    });
  }
  getAll() {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }
  getById(id) {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  create(client) {
    return this.http.post(this.apiUrl, client, { headers: this.getHeaders() });
  }
  update(id, client) {
    return this.http.put(`${this.apiUrl}/${id}`, client, { headers: this.getHeaders() });
  }
  delete(id) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  static \u0275fac = function ClientService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ClientService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ClientService, factory: _ClientService.\u0275fac, providedIn: "root" });
};

export {
  ClientService
};
//# sourceMappingURL=chunk-JTHXEV7M.js.map
