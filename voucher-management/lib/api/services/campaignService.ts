import axiosInstance from "@/lib/api/axios";

export const campaignService = {
  async list(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/campaigns", { params });
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await axiosInstance.post("/api/campaigns", data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await axiosInstance.put(`/api/campaigns/${id}`, data);
    return res.data;
  },
};
