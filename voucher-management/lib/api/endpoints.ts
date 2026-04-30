export const VOUCHER_ENDPOINTS = {
  LIST: "/api/v1/vouchers",
  CREATE: "/api/v1/vouchers",
  DETAILS: "/api/v1/vouchers/details",
  EXCEL: "/api/v1/vouchers/excel",
  DETAIL: (id: string) => `/api/v1/vouchers/${id}`,
  SUBMIT: (id: string) => `/api/v1/vouchers/${id}/submit`,
  CONFIRM: (id: string) => `/api/v1/vouchers/${id}/confirm`,
  CANCEL: (id: string) => `/api/v1/vouchers/${id}/cancel`,
};

export const MISSION_ENDPOINTS = {
  CREATE: "/api/v1/missions/missions",
  SEARCH: "/api/v1/missions/search",
  DETAIL: (id: string) => `/api/v1/missions/missions/${id}`,
  SUBMIT: (id: string) => `/api/v1/missions/missions/${id}/submit`,
  CONFIRM: (id: string) => `/api/v1/missions/missions/${id}/confirm`,
  CANCEL: (id: string) => `/api/v1/missions/missions/${id}/cancel`,
};

export const AUDIT_LOG_ENDPOINTS = {
  LIST: "/api/v1/audit-logs",
};

export const CAMPAIGN_ENDPOINTS = {
  LIST: "/api/v1/campaigns",
  CREATE: "/api/v1/campaigns",
  UPDATE: (id: string) => `/api/v1/campaigns/${id}`,
};

export const PARTNER_ENDPOINTS = {
  LIST: "/api/v1/partners",
  CREATE: "/api/v1/partners",
  UPDATE: (id: string) => `/api/v1/partners/${id}`,
};

export const REPORT_ENDPOINTS = {
  DATA: "/api/v1/reports",
};

export const DASHBOARD_ENDPOINTS = {
  STATS: "/api/v1/dashboard/stats",
  ACTIVITIES: "/api/v1/dashboard/activities",
};

// Identity Service endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/auth/login",
  REFRESH: "/api/v1/auth/refresh",
  ALLOWED_PAGES: "/api/v1/auth/allowed-pages",
};

export const SYSTEM_USER_ENDPOINTS = {
  LIST: "/api/v1/system-users",
  CREATE: "/api/v1/system-users",
  UPDATE: (id: string) => `/api/v1/system-users/${id}`,
  DELETE: (id: string) => `/api/v1/system-users/${id}`,
  RESET_PASSWORD: (id: string) => `/api/v1/system-users/${id}/reset-password`,
  ROLES: (id: string) => `/api/v1/system-users/${id}/roles`,
};

export const ROLE_ENDPOINTS = {
  LIST: "/api/v1/roles",
  CREATE: "/api/v1/roles",
  GET: (name: string) => `/api/v1/roles/${encodeURIComponent(name)}`,
  UPDATE: (name: string) => `/api/v1/roles/${encodeURIComponent(name)}`,
  DELETE: (name: string) => `/api/v1/roles/${encodeURIComponent(name)}`,
  ATTRIBUTES: (name: string) => `/api/v1/roles/${encodeURIComponent(name)}/attributes`,
};

export const PROFILE_ENDPOINTS = {
  GET: "/api/v1/profile",
  UPDATE: "/api/v1/profile",
  PASSWORD: "/api/v1/profile/password",
};
