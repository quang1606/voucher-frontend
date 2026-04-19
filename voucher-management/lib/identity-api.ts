import axios, { type AxiosInstance } from "axios";

export function getIdentityApi(authHeader?: string | null): AxiosInstance {
  return axios.create({
    baseURL: process.env.IDENTITY_SERVICE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
}
