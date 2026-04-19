import axios, { type AxiosInstance } from "axios";

export function getBackendApiWithRequestAuth(
  authHeader: string | null
): AxiosInstance {
  return axios.create({
    baseURL: process.env.PARTNER_GW_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
}
