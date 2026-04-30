import axiosInstance from "@/lib/api/axios";

export const auditLogService = {
  async list(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/audit-logs", { params });
    return res.data;
  },
};
