import {
  HttpClient,
  HttpHeaders,
  environment,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-XOMSVR7A.js";

// src/app/core/services/user.service.ts
var UserService = class _UserService {
  httpClient;
  baseUrl = `${environment.apiUrl}/api/users`;
  getHeaders() {
    const token = localStorage.getItem("accessToken");
    return new HttpHeaders({
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    });
  }
  getAll() {
    return this.httpClient.get(this.baseUrl, { headers: this.getHeaders() });
  }
  getById(id) {
    return this.httpClient.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
  create(user) {
    return this.httpClient.post(this.baseUrl, user, { headers: this.getHeaders() });
  }
  update(id, user) {
    return this.httpClient.put(`${this.baseUrl}/${id}`, user, { headers: this.getHeaders() });
  }
  delete(id) {
    return this.httpClient.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  static \u0275fac = function UserService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UserService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _UserService, factory: _UserService.\u0275fac, providedIn: "root" });
};

export {
  UserService
};
//# sourceMappingURL=chunk-3LXRPPC5.js.map
