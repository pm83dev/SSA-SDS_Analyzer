import {
  ApiService
} from "./chunk-26ID2PJJ.js";
import {
  inject,
  ɵɵdefineInjectable
} from "./chunk-YE2GV6RL.js";

// src/app/core/services/scenario.service.ts
var ScenarioService = class _ScenarioService {
  api = inject(ApiService);
  getExpiring(days) {
    return this.api.get(`/scenarios/expiring?days=${days}`);
  }
  getAllScenarios() {
    return this.api.get("/scenarios");
  }
  getStats() {
    return this.api.get("/dashboard/stats");
  }
  getNotifications(unreadOnly = false) {
    return this.api.get(`/notifications${unreadOnly ? "?unreadOnly=true" : ""}`);
  }
  markNotificationRead(id) {
    return this.api.put(`/notifications/${id}/read`, {});
  }
  markAllNotificationsRead() {
    return this.api.put("/notifications/read-all", {});
  }
  static \u0275fac = function ScenarioService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScenarioService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ScenarioService, factory: _ScenarioService.\u0275fac, providedIn: "root" });
};

export {
  ScenarioService
};
//# sourceMappingURL=chunk-HR5Y3KXV.js.map
