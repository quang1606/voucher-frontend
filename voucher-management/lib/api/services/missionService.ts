import axiosInstance from "@/lib/api/axios";

export const missionService = {
  async search(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/missions/search", { params });
    return res.data;
  },
  async getById(id: string | number) {
    const res = await axiosInstance.get(`/api/missions/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await axiosInstance.post("/api/missions", data);
    return res.data;
  },
  async submit(id: string | number) {
    const res = await axiosInstance.put(`/api/missions/${id}/submit`);
    return res.data;
  },
  async confirm(id: string | number, action: "APPROVED" | "REJECTED", reason?: string) {
    const res = await axiosInstance.put(`/api/missions/${id}/confirm`, { action, ...(reason ? { reason } : {}) });
    return res.data;
  },
  async cancel(id: string | number) {
    const res = await axiosInstance.put(`/api/missions/${id}/cancel`);
    return res.data;
  },
};
