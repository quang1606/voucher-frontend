export interface PageRegistryItem {
  key: string;
  label: string;
  description: string;
}

export const PAGE_REGISTRY: PageRegistryItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Tổng quan hệ thống" },
  { key: "vouchers", label: "Vouchers", description: "Quản lý voucher" },
  { key: "missions", label: "Missions", description: "Quản lý mission" },
  { key: "partners", label: "Partners", description: "Quản lý đối tác" },
  { key: "audit-logs", label: "Audit Logs", description: "Lịch sử hoạt động" },
  { key: "invoices", label: "Invoices", description: "Quản lý hóa đơn giả lập" },
  { key: "settings", label: "Settings", description: "Cài đặt hệ thống" },
];

export const PAGE_ALL = "page-all";
