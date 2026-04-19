import axiosInstance from "@/lib/api/axios";

export const partnerService = {
  async list(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/partners", { params });
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await axiosInstance.post("/api/partners", data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await axiosInstance.put(`/api/partners/${id}`, data);
    return res.data;
  },
};
