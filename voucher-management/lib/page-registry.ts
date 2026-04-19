export interface PageRegistryItem {
  key: string;
  label: string;
  description: string;
}

export const PAGE_REGISTRY: PageRegistryItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Tổng quan hệ thống" },
  { key: "vouchers", label: "Vouchers", description: "Quản lý voucher" },
  { key: "campaigns", label: "Campaigns", description: "Quản lý chiến dịch" },
  { key: "partners", label: "Partners", description: "Quản lý đối tác" },
  { key: "reports", label: "Reports", description: "Báo cáo thống kê" },
  { key: "settings", label: "Settings", description: "Cài đặt hệ thống" },
];

export const PAGE_ALL = "page-all";
