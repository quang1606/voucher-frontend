export interface Voucher {
  id: number;
  requestId: string;
  requestMode: "SINGLE" | "EXCEL";
  creatorType: "SYSTEM" | "MERCHANT";
  voucherPurpose: "REWARD" | "HUNT";
  fileName: string | null;
  status: "DRAFT" | "CANCELLED" | "PENDING_APPROVE" | "INIT" | "APPROVED" | "REJECTED" | "PROCESSING" | "FAILED" | "FINISH" | "SUCCESS";
  reason: string | null;
  createdTime: string;
  createdBy: string;
  updatedTime: string;
  updatedBy: string | null;
  confirmedTime: string | null;
  confirmedBy: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED";
  totalVouchers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalVouchers: number;
  activeVouchers: number;
  totalCampaigns: number;
  totalPartners: number;
  totalRedemptions: number;
  revenueGenerated: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  realmRoles?: string[];
  // Merchant fields
  storeName?: string;
  phone?: string;
  category?: string;
  status?: string;
}

export interface KeycloakRole {
  id?: string;
  name: string;
  description?: string;
  attributes?: Record<string, string[]>;
}

// Identity Service wraps all responses in this format
export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  data: T;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// Keep for backward compat in auth store
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}
