import axiosInstance from "@/lib/api/axios";

export const profileService = {
  async getProfile() {
    const res = await axiosInstance.get("/api/profile");
    return res.data;
  },
  async updateProfile(data: { firstName?: string; lastName?: string; email?: string; phone?: string; storeName?: string; currentPassword?: string; newPassword?: string }) {
    const res = await axiosInstance.put("/api/profile/update", data);
    return res.data;
  },
};
