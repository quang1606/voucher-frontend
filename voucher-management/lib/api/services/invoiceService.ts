import axiosInstance from "@/lib/api/axios";

export const invoiceService = {
  async list(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/invoices", { params });
    return res.data;
  },
  async create(data: { title: string; nameStore: string; amount: number }) {
    const res = await axiosInstance.post("/api/invoices", data);
    return res.data;
  },
  async getById(id: string | number) {
    const res = await axiosInstance.get(`/api/invoices/${id}`);
    return res.data;
  },
};
