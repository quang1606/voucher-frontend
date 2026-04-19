import axiosInstance from "@/lib/api/axios";

export const reportService = {
  async getReportData(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/reports", { params });
    return res.data;
  },
};
