import axiosInstance from "@/lib/api/axios";

function unwrap(res: { data: { data?: unknown } }) {
  return res.data.data !== undefined ? res.data.data : res.data;
}

export const voucherService = {
  async list(params?: Record<string, unknown>) {
    const res = await axiosInstance.get("/api/vouchers", { params });
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await axiosInstance.post("/api/vouchers", data);
    return res.data;
  },
  async uploadExcel(file: File, discountType: string, requestId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("discountType", discountType);
    formData.append("requestId", requestId);
    const res = await axiosInstance.post("/api/vouchers/excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  async submit(id: string | number) {
    const res = await axiosInstance.put(`/api/vouchers/${id}/submit`);
    return res.data;
  },
  async confirm(id: string | number, action: "APPROVED" | "REJECTED") {
    const res = await axiosInstance.put(`/api/vouchers/${id}/confirm?action=${action}`);
    return res.data;
  },
  async cancel(id: string | number) {
    const res = await axiosInstance.put(`/api/vouchers/${id}/cancel`);
    return res.data;
  },
};
