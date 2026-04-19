import axiosInstance from "@/lib/api/axios";

// Helper: Identity Service wraps response in { status, code, message, data }
// Unwrap .data.data nếu có, fallback .data
function unwrap(res: { data: { data?: unknown } }) {
  return res.data.data !== undefined ? res.data.data : res.data;
}

export const systemUserService = {
  async listUsers() {
    const res = await axiosInstance.get("/api/system-users");
    return unwrap(res);
  },
  async createUser(data: {
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    password: string;
    enabled?: boolean;
    role?: string;
    storeName?: string;
    phone?: string;
    category?: string;
  }) {
    const res = await axiosInstance.post("/api/system-users", data);
    return unwrap(res);
  },
  async updateUser(id: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    storeName?: string;
    phone?: string;
    category?: string;
    status?: string;
  }) {
    const res = await axiosInstance.put(`/api/system-users/${id}`, data);
    return unwrap(res);
  },
  async deleteUser(id: string) {
    const res = await axiosInstance.delete(`/api/system-users/${id}`);
    return unwrap(res);
  },
  async resetPassword(id: string, password: string) {
    const res = await axiosInstance.post(`/api/system-users/${id}/reset-password`, { password });
    return unwrap(res);
  },
  async getUserRoles(id: string) {
    const res = await axiosInstance.get(`/api/system-users/${id}/roles`);
    return unwrap(res);
  },
  async assignRoles(id: string, roles: { id: string; name: string }[]) {
    const res = await axiosInstance.post(`/api/system-users/${id}/roles`, { action: "assign", roles });
    return unwrap(res);
  },
  async unassignRoles(id: string, roles: { id: string; name: string }[]) {
    const res = await axiosInstance.post(`/api/system-users/${id}/roles`, { action: "remove", roles });
    return unwrap(res);
  },
  async listRoles() {
    const res = await axiosInstance.get("/api/system-users/roles");
    return unwrap(res);
  },
  async createRole(data: { name: string; description?: string; attributes?: Record<string, string[]> }) {
    const res = await axiosInstance.post("/api/system-users/roles", data);
    return unwrap(res);
  },
  async getRole(roleName: string) {
    const res = await axiosInstance.get(`/api/system-users/roles/${roleName}`);
    return unwrap(res);
  },
  async updateRole(roleName: string, data: { description?: string }) {
    const res = await axiosInstance.put(`/api/system-users/roles/${roleName}`, data);
    return unwrap(res);
  },
  async deleteRole(roleName: string) {
    const res = await axiosInstance.delete(`/api/system-users/roles/${roleName}`);
    return unwrap(res);
  },
  async updateRoleAttributes(roleName: string, allowedPages: string[]) {
    const res = await axiosInstance.put(`/api/system-users/roles/${roleName}/attributes`, { allowedPages });
    return unwrap(res);
  },
};
