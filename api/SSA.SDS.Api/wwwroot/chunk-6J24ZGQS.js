import {
  HttpClient,
  catchError,
  environment,
  of,
  tap,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-XOMSVR7A.js";

// src/app/core/services/auth.service.ts
var AuthService = class _AuthService {
  httpClient;
  baseUrl = `${environment.apiUrl}/api`;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  login(username, password) {
    return this.httpClient.post(`${this.baseUrl}/auth/login`, { username, password }).pipe(tap((res) => {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("userRole", res.role);
      localStorage.setItem("username", username);
      const token = res.accessToken;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          localStorage.setItem("userId", payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload["sub"] || "");
        } catch (e) {
          console.warn("Non \xE8 stato possibile estrarre l'userId dal token");
        }
      }
    }));
  }
  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  }
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }
  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  }
  refresh() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }
    return this.httpClient.post(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(tap((res) => {
      if (res) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
      }
    }), catchError(() => of(null)));
  }
  static \u0275fac = function AuthService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
};

export {
  AuthService
};
//# sourceMappingURL=chunk-6J24ZGQS.js.map
