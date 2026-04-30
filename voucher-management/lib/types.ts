export interface Voucher {
  id: number;
  requestId: string;
  requestMode: "SINGLE" | "EXCEL";
  creatorType: "PARTNER" | "SYSTEM";
  voucherPurpose: "REWARD" | "HUNT";
  fileName: string | null;
  status: "DRAFT" | "CANCELLED" | "PENDING_APPROVE" | "INIT" | "APPROVED" | "REJECTED" | "FAILED" | "FINISHED";
  reason: string | null;
  totalVoucher: number;
  statusCounts?: { requestStatus: string; count: number }[];
  createdTime: string;
  createdBy: string;
  updatedTime: string;
  updatedBy: string | null;
  confirmedTime: string | null;
  confirmedBy: string | null;
  storeName?: string;
}

export interface VoucherDetail {
  id: number;
  voucherCode: string;
  requestId: string;
  voucherName: string;
  description: string;
  customerTier: string;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  maxDiscount: number;
  minOrderValue: number;
  totalStock: number;
  availableStock: number;
  requestStatus: string;
  maxCollect: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  errorMessage: string | null;
  createdAt: string;
}

export interface Mission {
  missionId: number;
  requestId: string;
  missionName: string;
  missionDescription: string;
  targetValue: number;
  rewardType: "POINT" | "VOUCHER";
  rewardValue: string;
  partnerId: number | null;
  startDate: string;
  endDate: string;
  status: "CANCELLED" | "PENDING_APPROVE" | "INIT" | "APPROVED" | "REJECTED" | "FAILED" | "FINISH";
  createdDate?: string;
  updatedDate?: string;
}

export interface AuditLog {
  id: number;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
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
