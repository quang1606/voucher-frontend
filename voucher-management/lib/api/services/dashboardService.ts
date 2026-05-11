import axiosInstance from "@/lib/api/axios";

export const dashboardService = {
  async getVoucherMonthlyStats(year: number) {
    const res = await axiosInstance.get("/api/dashboard/voucher-monthly-stats", { params: { year } });
    return res.data;
  },
  async getVoucherRequestStats() {
    const res = await axiosInstance.get("/api/dashboard/voucher-request-stats");
    return res.data;
  },
  async getMissionStats() {
    const res = await axiosInstance.get("/api/dashboard/mission-stats");
    return res.data;
  },
};
