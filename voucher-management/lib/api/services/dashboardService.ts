import axiosInstance from "@/lib/api/axios";

export const dashboardService = {
  async getStats() {
    const res = await axiosInstance.get("/api/dashboard/stats");
    return res.data;
  },
  async getActivities() {
    const res = await axiosInstance.get("/api/dashboard/activities");
    return res.data;
  },
};
